import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

async function initializeAppWithSecrets() {
    const secrets = await fetchSecrets();
    if (secrets) {
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
        const storage = getStorage(app);

        function createTestCard(folderName) {
            const testListElement = document.getElementById('test-list');
            const card = document.createElement('div');
            card.classList.add('card');
            card.addEventListener('click', () => downloadFilesInFolder(folderName));
            const details = document.createElement('div');
            details.classList.add('test-details');

            const title = document.createElement('div');
            title.classList.add('h3');
            title.textContent = folderName;

            details.appendChild(title);
            card.appendChild(details);
            testListElement.appendChild(card);
        }

        async function downloadFilesInFolder(folderName) {
            const folderRef = ref(storage, folderName);
            const res = await listAll(folderRef);
            res.items.forEach(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                const link = document.createElement('a');
                link.href = url;
                link.download = itemRef.name;
                link.click();
            });
        }

        async function listFolders() {
            const listRef = ref(storage);
            try {
                const res = await listAll(listRef);
                const folderNames = new Set();
                res.prefixes.forEach((folderRef) => {
                    folderNames.add(folderRef.name);
                });
                folderNames.forEach((folderName) => {
                    createTestCard(folderName);
                });
            } catch (error) {
                console.error(error);
            }
        }

        listFolders();
    } else {
        console.error('Secrets not available');
    }
}

initializeAppWithSecrets();

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
