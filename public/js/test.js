// document.addEventListener('DOMContentLoaded', () => {
//     fetch('/api/tests', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({})
//     })
//     .then(response => response.json())
//     .then(tests => {
//         const testList = document.getElementById('test-list');
//         tests.forEach(test => {
//             const listItem = document.createElement('li');
//             listItem.classList.add('test-item');
//             listItem.innerHTML = `
//                 <div class="card">
//                     <img src="/photo/test.png" alt="Test">
//                     <div class="card-content">
//                         <h3>${test.test}</h3>
//                         <p class="test-info">Date: ${new Date(test.date).toLocaleDateString()}</p>
//                         <p class="test-info">Start Time: ${test.start_time}</p>
//                         <p class="test-info">End Time: ${test.end_time}</p>
//                     </div>
//                 </div>
//             `;
//             testList.appendChild(listItem);
//             const card = listItem.querySelector('.card');
//             const testName = listItem.querySelector('h3').textContent;
//             const start_time = listItem.querySelector('p').textContent;
//             const end_time = listItem.querySelector('p').textContent;
//             const date = list.querySelector('p').textContent;

//             card.addEventListener('click', () => {
//                 localStorage.setItem('test', testName);
//                 localStorage.setItem('start_time',start_time);
//                 localStorage.setItem('end_time',end_time);
//                 localStorage.setItem('date',date);
//                 window.location.href = "/instruction";
//             });
//         });
//     })
//     .catch(error => console.error('Error fetching tests:', error));
// });

// function checkUserDetails() {
//     const user = localStorage.getItem('user');
//     if (!user) {
//         alert('You are not logged in. Redirecting to login page...');
//         window.location.href = '/login';
//     }
// }
// checkUserDetails();



document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(tests => {
        const testList = document.getElementById('test-list');
        tests.forEach(test => {
            const listItem = document.createElement('li');
            listItem.classList.add('test-item');
            listItem.innerHTML = `
                <div class="card">
                    <img src="/photo/test.png" alt="Test">
                    <div class="card-content">
                        <h3>${test.test}</h3>
                        <p class="test-info">Date: ${new Date(test.date).toLocaleDateString()}</p>
                        <p class="test-info">Start Time: ${test.start_time}</p>
                        <p class="test-info">End Time: ${test.end_time}</p>
                    </div>
                </div>
            `;
            testList.appendChild(listItem);
            const card = listItem.querySelector('.card');
            const testName = test.test;
            const start_time = test.start_time;
            const end_time = test.end_time;
            const date = new Date(test.date).toLocaleDateString();
            card.addEventListener('click', () => {
                localStorage.setItem('test', testName);
                localStorage.setItem('start_time', start_time);
                localStorage.setItem('end_time', end_time);
                localStorage.setItem('date', date);
                window.location.href = "/instruction";
            });
        });
    })
    .catch(error => console.error('Error fetching tests:', error));
});
function checkUserDetails() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = '/login';
    }
}
checkUserDetails();
