const pyq = document.querySelector('.pyq');
const logout = document.querySelector('.logout');
const doubt = document.querySelector('.doubt');
const test = document.querySelector('.test');
const bank = document.querySelector('.bank');
const result = document.querySelector('.result');

function checkUserDetails() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = '/login';
    }
}
checkUserDetails();

pyq.addEventListener('click',()=>{
    window.location.href="/notes";
})

logout.addEventListener('click',()=>{
    if(confirm("Do you want to logout?")){
        localStorage.removeItem('user');
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

