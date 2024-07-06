const pyq = document.querySelector('.pyq');
const logout = document.querySelector('.logout');
const doubt = document.querySelector('.doubt');
const test = document.querySelector('.test');
const bank = document.querySelector('.bank');
const result = document.querySelector('.result');


function checkUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: user._id }) 
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/';
            } else {
                if (data.user.domain === 'Admin') {
                    window.location.href = '/';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/'; 
        });
    } else {
        window.location.href = '/'; 
    }
}
checkUserDetails();

pyq.addEventListener('click',()=>{
    window.location.href="/notes";
})

logout.addEventListener('click',()=>{
    if(confirm("Do you want to logout?")){
        localStorage.clear();
        window.location.href = "/";
    }
})

doubt.addEventListener('click',()=>{
    window.location.href="/coming";
})

test.addEventListener('click',()=>{
    window.location.href = "/test";
})

bank.addEventListener('click',()=>{
    window.location.href="/question-bank";
})

result.addEventListener('click',()=>{
    window.location.href = "/result";
})

