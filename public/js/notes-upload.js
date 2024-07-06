import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

async function fetchSecrets() {
    try {
        const response = await fetch('/api/secrets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch secrets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching secrets:', error);
        return null;
    }
}

async function initializeFirebase() {
    const secrets = await fetchSecrets();
    if (!secrets) {
        console.error('Failed to initialize Firebase due to missing secrets');
        return null;
    }

    const firebaseConfig = {
        apiKey: secrets.apiKey,
        authDomain: secrets.authDomain,
        projectId: secrets.projectId,
        storageBucket: secrets.storageBucket,
        messagingSenderId: secrets.messagingSenderId,
        appId: secrets.appId,
        measurementId: secrets.measurementId
    };

    const app = initializeApp(firebaseConfig);
    return getStorage(app);
}

document.addEventListener("DOMContentLoaded", async () => {
    const storage = await initializeFirebase();
    if (!storage) {
        alert('Failed to initialize Firebase. Please try again later.');
        return;
    }

    const uploadButton = document.querySelector('.upload-button');
    const progressBar = document.getElementById('progress-bar');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.'));
        const storageRef = ref(storage, fileNameWithoutExtension.toUpperCase().trim() + '/' + file.name);

        const metadata = {
            contentType: file.type,
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress.toFixed(2) + '%';
            },
            (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        alert('User does not have permission to access the object');
                        break;
                    case 'storage/canceled':
                        alert('User canceled the upload');
                        break;
                    case 'storage/unknown':
                        alert('Unknown error occurred, inspect error.serverResponse');
                        break;
                }
            },
            () => {
                progressBar.style.width = '100%';
                alert('Upload complete!');
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 100); 
            }
        );
    });
});



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
            if (!data.success || !data.user || data.user._id !== user._id) {
                window.location.href = '/';
            } else if (data.user.domain !== 'Admin') {
                window.location.href = '/dashboard';
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