const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");

dotenv.config();
const server = express();
const port = process.env.PORT || 10000;

server.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: true,
}));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));

const { Schema } = mongoose;
const userSchema = new Schema({
    username: { type: String },
    password: String,
    email: { type: String, unique: true },
    phone: { type: Number },
    gender: String,
    domain: String
});

const questionSchema = new Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true }
});

const answerSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String },
    answers: { type: [String], default: [] },
    test_name: { type: String, required: true },
    submitted: { type: Number, default: 0 },
    correct: {type:Number, default:null},
    incorrect: {type:Number, default:null},
    skipped: {type:Number, default:null},
    maxMarks: {type:Number, default:null},
    obtainedMarks: {type:Number, default:null}
});

const testSchema = new Schema({
    test: { type: String, required: true },
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    questions: [questionSchema]
});

answerSchema.index({ userId: 1, test_name: 1 }, { unique: true });
const Test = mongoose.model('Test', testSchema);
const Answer = mongoose.model('Answer', answerSchema);
const User = mongoose.model("User", userSchema);

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

async function main() {
    await mongoose.connect(`mongodb+srv://username:password@cluster0.3r4pbup.mongodb.net/students`, { auth: { username: MONGODB_USERNAME, password: MONGODB_PASSWORD } });
    console.log("Database connected"); 
}

main().catch(err => console.error(err));

server.post('/api/update-answer', async (req, res) => {
    const { username,userId, questionIndex, answer, test_name } = req.body;
    try {
        let userAnswers = await Answer.findOne({ userId, test_name });

        if (!userAnswers) {
            userAnswers = new Answer({ username, userId, answers: [], test_name });
        }
        userAnswers.answers[questionIndex] = answer;
        await userAnswers.save();

        res.status(200).json({ message: 'Answer updated successfully', answers: userAnswers.answers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating answer', error });
    }
});

server.post('/signup', async (req, res) => {
    try {
        const { username, email, password, phone, gender, domain } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            phone,
            gender,
            domain
        });

        await newUser.save();
        res.send(`
            <script>
                alert('Signup successfully!');
                window.location.href = '/login';
            </script>
        `);
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
            res.send(`
                <script>
                    alert('Username already exists. Please choose a different one.');
                    window.location.href = '/signup'; 
                </script>
            `);
        } else {
            console.error(err);
            res.status(500).send("Error occurred during signup");
        }
    }
});

server.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        req.session.email = email;
        if (!user || !await bcrypt.compare(password, user.password)) {
            res.send(`
                <script>
                    alert('Invalid Username or Password!');
                    window.location.href='/login';
                </script>
            `);
        } else {
            res.send(`
                <script>
                    localStorage.setItem('user', JSON.stringify({
                        _id: '${user._id}',
                        username: '${user.username}',
                        email: '${user.email}',
                        phone: '${user.phone}',
                        gender: '${user.gender}',
                        domain: '${user.domain}'
                    }));
                    alert('Login successfully!');
                    if ('${user.domain}' === 'Admin') {
                        window.location.href = '/admin_dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                </script>
            `);
        }
    } catch (err) {
        console.error(err);
        res.send(`
            <script>
                alert('Internal error occurred!');
                window.location.href='/login';
            </script>
        `);
    }
});

server.post('/api/questions', async (req, res) => {
    const testName = req.body.testName;
    if (!testName) {
        return res.status(400).send("Test name is required");
    }
    try {
        const test = await Test.findOne({ test: testName }, 'questions');
        if (!test) {
            return res.status(404).send("Test not found");
        }
        const questions = test.questions.map(question => ({
            text: question.text,
            options: question.options
        }));
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching questions");
    }
});

server.post('/api/ans-questions', async (req, res) => {
    try {
        const { userId, testName } = req.body;
        const test = await Test.findOne({ test: testName }).populate('questions');
        const userAnswers = await Answer.findOne({ userId, test_name: testName });

        if (!test || !userAnswers) {
            return res.status(404).send("Test or answers not found for this user and test");
        }

        const questions = test.questions.map((question, index) => {
            return {
                _id: question._id,
                text: question.text,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswers.answers[index] || null
            };
        });

        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching questions and answers");
    }
});

server.post('/api/get-user-answers', async (req, res) => {
    const { userId, test_name } = req.body;
    try {
        const userAnswers = await Answer.findOne({ userId, test_name });
        if (!userAnswers) {
            return res.status(404).json({ message: 'No answers found for this user and test' });
        }
        if (userAnswers.submitted === 0) {
            return res.redirect('/submit-page.html'); 
        }
        res.status(200).json({ answers: userAnswers.answers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user answers', error });
    }
});


server.post('/api/submit-test', async (req, res) => {
    const { userId, test_name } = req.body;
    try {
        let userAnswers = await Answer.findOne({ userId, test_name });
        if (!userAnswers) {
            userAnswers = new Answer({ userId, test_name, answers: [], submitted: 1 });
        }
        userAnswers.submitted = 1;
        const test = await Test.findOne({ test: test_name });
        if (!test || !test.questions.length) {
            return res.status(404).json({ message: 'No questions found for this test' });
        }
        let correct = 0, incorrect = 0, skipped = 0;
        test.questions.forEach((question, index) => {
            const answer = userAnswers.answers[index];
            if (!answer) {
                skipped++;
            } else if (answer === question.correctAnswer) {
                correct++;
            } else {
                incorrect++;
            }
        });
        userAnswers.correct = correct;
        userAnswers.incorrect = incorrect;
        userAnswers.skipped = skipped;
        userAnswers.maxMarks = test.questions.length * 4;
        userAnswers.obtainedMarks = (correct * 4) - incorrect;
        await userAnswers.save();
        res.status(200).json({
            message: 'Test submitted and results calculated successfully',
            correct,
            incorrect,
            skipped,
            maxMarks: userAnswers.maxMarks,
            obtainedMarks: userAnswers.obtainedMarks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test and calculating results', error });
    }
});

server.post('/api/check-submission', async (req, res) => {
    const { userId, test_name } = req.body;
    try {
        const userAnswers = await Answer.findOne({ userId, test_name });
        if (!userAnswers) {
            return res.status(404).json({ message: 'No answers found for this user and test' });
        }
        res.status(200).json({ submitted: userAnswers.submitted });
    } catch (error) {
        console.error('Error checking submission:', error);
        res.status(500).json({ message: 'Error checking submission', error });
    }
});

server.post('/api/get-test-results', async (req, res) => {
    const { userId, test_name } = req.body;
    try {
        const userAnswers = await Answer.findOne({ userId, test_name });
        if (!userAnswers) {
            return res.status(404).json({ message: 'No answers found for this user and test' });
        }
        res.status(200).json({
            correct: userAnswers.correct,
            incorrect: userAnswers.incorrect,
            skipped: userAnswers.skipped,
            maxMarks: userAnswers.maxMarks,
            obtainedMarks: userAnswers.obtainedMarks
        });
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ message: 'Error fetching test results', error });
    }
});

server.post('/api/tests', async (req, res) => {
    try {
        const tests = await Test.find({}, 'test date start_time end_time');
        res.json(tests);
    } catch (error) {
        console.error('Error fetching test details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/api/submitted-tests', async (req, res) => {
    try {
        const { userId } = req.body;
        const submittedTests = await Answer.find({ userId, submitted: 1 }, 'test_name');
        const submittedTestNames = submittedTests.map(test => test.test_name);
        const tests = await Test.find({ test: { $in: submittedTestNames } }, 'test date start_time end_time');
        res.json(tests);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching submitted tests");
    }
});

server.post('/api/secrets',async(req,res)=>{
    const secrets = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        measurementId: process.env.MEASUREMENT_ID
    } 
    res.json(secrets);
});

server.post('/api/secrets/question',async(req,res)=>{
    const secrets = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
    res.json(secrets);
});

server.post('/api/user', async (req, res) => {
    const { _id } = req.body;
    try {
        const user = await User.findOne({ _id });
        if (user) {
            res.send({ success: true, user });
        } else {
            res.send({ success: false });
        }
    } catch (error) {
        res.send({ success: false, error: error.message });
    }
});


server.post('/api/save-test', async (req, res) => {
    let { test, date, start_time, end_time, questions } = req.body;
    test = test.trim();
    try {
        const existingTest = await Test.findOne({ test });
        if (existingTest) {
            return res.status(400).json({ message: 'Test name already exists' });
        }
        const newTest = new Test({
            test,
            date,
            start_time,
            end_time,
            questions
        });

        await newTest.save();
        res.status(200).json({ message: 'Test saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving test', error });
    }
});



server.post('/api/students-for-test', async (req, res) => {
    const { testName } = req.body;
    try {
        const answers = await Answer.find({ test_name: testName, submitted: 1 }, 'userId');
        const userIds = answers.map(answer => answer.userId);
        const users = await User.find({ _id: { $in: userIds } }, 'username email phone');
        res.json(users);
    } catch (err) {
        console.error('Error fetching students for test:', err);
        res.status(500).send("Error fetching students for test");
    }
});

server.post('/api/all-submitted-tests', async (req, res) => {
    try {
        const submittedTests = await Answer.find({ submitted: 1 }).distinct('test_name');
        const tests = await Test.find({ test: { $in: submittedTests } }, 'test date start_time end_time');
        res.json(tests);
    } catch (err) {
        console.error('Error fetching submitted tests:', err);
        res.status(500).send("Error fetching submitted tests");
    }
});

server.post('/api/delete-tests', async (req, res) => {
    const { testName } = req.body;
    try {
        const result = await Test.findOneAndDelete({ test: testName });
        if (result) {
            res.status(200).send({ message: 'Test deleted successfully' });
        } else {
            res.status(404).send({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});

const signup = fs.readFileSync('./public/html/signup.html', 'utf8');
const login = fs.readFileSync('./public/html/login.html', 'utf8');
const home = fs.readFileSync('./public/html/index.html', 'utf8');
const dashboard = fs.readFileSync('./public/html/dashboard.html', 'utf8');
const coming = fs.readFileSync('./public/html/coming.html', 'utf8');
const analysis = fs.readFileSync('./public/html/dash.html', 'utf8');
const instruction = fs.readFileSync('./public/html/instruction.html', 'utf8');
const quiz = fs.readFileSync('./public/html/quiz.html', 'utf8');
const result_dashboard = fs.readFileSync('./public/html/res_dash.html', 'utf8');
const result = fs.readFileSync('./public/html/result.html', 'utf8');
const test = fs.readFileSync('./public/html/test.html', 'utf8');
const redirect = fs.readFileSync('./public/html/thanks_res.html', 'utf8');
const thanks = fs.readFileSync('./public/html/thanks.html', 'utf8');
const notes = fs.readFileSync('./public/html/notes.html','utf8');
const questionbank = fs.readFileSync('./public/html/question-bank.html','utf8');
const admin_notes = fs.readFileSync('./public/html/admin-notes.html','utf8');
const admin_dashboard = fs.readFileSync('./public/html/admin-dashboard.html', 'utf8');
const notes_upload = fs.readFileSync('./public/html/notes-upload.html','utf8');
const admin_question_bank = fs.readFileSync('./public/html/admin-question-bank.html','utf8');
const question_upload = fs.readFileSync('./public/html/question-upload.html','utf8');
const admin_test = fs.readFileSync('./public/html/admin-test.html','utf8');
const admin_result = fs.readFileSync('./public/html/admin-result.html','utf8');
const admin_result_dashboard = fs.readFileSync('./public/html/admin-result-dashboard.html','utf8');
const student_result_dashboard = fs.readFileSync('./public/html/student_result_dashboard.html','utf8');
const test_upload = fs.readFileSync('./public/html/test_upload.html','utf8');

server.get('/signup', (req, res) => {
    res.send(signup);
});

server.get('/', (req, res) => {
    res.send(home);
});

server.get('/login', (req, res) => {
    res.send(login);
});

server.get('/dashboard', (req, res) => {
    res.send(dashboard);
});

server.get('/coming', (req, res) => {
    res.send(coming);
});

server.get('/analysis', (req, res) => {
    res.send(analysis);
});

server.get('/instruction', (req, res) => {
    res.send(instruction);
});

server.get('/quiz', (req, res) => {
    res.send(quiz);
});

server.get('/result_dashboard', (req, res) => {
    res.send(result_dashboard);
});

server.get('/result', (req, res) => {
    res.send(result);
});

server.get('/test', (req, res) => {
    res.send(test);
});

server.get('/redirect', (req, res) => {
    res.send(redirect);
});

server.get('/thanks', (req, res) => {
    res.send(thanks);
});

server.get('/notes',(req,res)=>{
    res.send(notes);
});

server.get('/question-bank',(req,res)=>{
    res.send(questionbank);
});

server.get('/admin-notes', (req, res) => {
    res.send(admin_notes);
});

server.get('/admin_dashboard', (req, res) => {
    res.send(admin_dashboard);
});

server.get('/notes_upload',(req,res)=>{
    res.send(notes_upload);
});

server.get('/admin_question_bank',(req,res)=>{
    res.send(admin_question_bank);
});

server.get('/question_upload',(req,res)=>{
    res.send(question_upload);
});

server.get('/admin_test',(req,res)=>{
    res.send(admin_test);
});

server.get('/admin_result', (req, res) => {
    res.send(admin_result);
});

server.get('/admin_result_dashboard', (req, res) => {
    res.send(admin_result_dashboard);
});

server.get('/student_result_dashboard', (req, res) => {
    res.send(student_result_dashboard);
});

server.get('/test_upload',(req,res)=>{
    res.send(test_upload);
});

server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
