import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const loader = document.getElementById('loader');
const addButton = document.getElementById('add-button');
const deleteButton = document.getElementById('delete-button');

async function fetchSecrets() {
    try {
        loader.style.display = 'block';
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
    } finally {
        loader.style.display = 'none';
    }
}

async function initializeFirebase() {
    const secrets = await fetchSecrets();
    if (!secrets) {
        console.error('Failed to initialize Firebase due to missing secrets');
        return;
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
    const storage = getStorage(app);
    return storage;
}

let storage;
initializeFirebase().then((result) => {
    storage = result;
    listFolders();
});

addButton.addEventListener('click', () => {
    window.location.href = '/notes_upload';
});

deleteButton.addEventListener('click', () => {
    const selectedFolders = document.querySelectorAll('.folder-checkbox:checked');
    const totalFolders = selectedFolders.length;
    let deletedFolders = 0;

    selectedFolders.forEach((checkbox) => {
        deleteFolder(checkbox.value).then(() => {
            deletedFolders++;
            if (deletedFolders === totalFolders) {
                alert('All selected folders have been deleted.');
            }
        });
    });
});

function createTestCard(folderName) {
    const testListElement = document.getElementById('test-list');
    if (!testListElement) {
        console.error('Test list element not found');
        return;
    }

    const container = document.createElement('div');
    container.classList.add('card-container');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('folder-checkbox');
    checkbox.value = folderName;
    checkbox.addEventListener('change', toggleDeleteButton);

    let pressTimer;

    const card = document.createElement('div');
    card.classList.add('card');

    // Add support for touch events
    card.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            card.classList.add('long-press');
            enableAllCheckboxes(checkbox);
        }, 1000);
    });

    card.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });

    card.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
    });

    card.addEventListener('mousedown', (e) => {
        pressTimer = setTimeout(() => {
            card.classList.add('long-press');
            enableAllCheckboxes(checkbox);
        }, 1000);
    });

    card.addEventListener('mouseup', () => {
        clearTimeout(pressTimer);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(pressTimer);
    });

    card.addEventListener('click', (event) => {
        if (!checkbox.checked) {
            if (!card.classList.contains('long-press')) {
                downloadFilesInFolder(folderName);
            } else {
                card.classList.remove('long-press');
            }
        }
    });

    const details = document.createElement('div');
    details.classList.add('test-details');

    const title = document.createElement('div');
    title.classList.add('h3');
    title.textContent = folderName;

    details.appendChild(title);
    card.appendChild(details);

    container.appendChild(checkbox);
    container.appendChild(card);

    testListElement.appendChild(container);
}

function enableAllCheckboxes(clickedCheckbox) {
    const allCheckboxes = document.querySelectorAll('.folder-checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.style.display = 'block';
        checkbox.checked = false;
    });
    clickedCheckbox.checked = true;
    toggleDeleteButton();
}

function toggleDeleteButton() {
    const anyChecked = document.querySelectorAll('.folder-checkbox:checked').length > 0;
    deleteButton.style.display = anyChecked ? 'block' : 'none';

    if (!anyChecked) {
        const allCheckboxes = document.querySelectorAll('.folder-checkbox');
        allCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
        });
    }
}

function downloadFilesInFolder(folderName) {
    const folderRef = ref(storage, folderName);
    listAll(folderRef)
        .then((res) => {
            res.items.forEach((itemRef) => {
                getDownloadURL(itemRef)
                    .then((url) => {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = itemRef.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch((error) => {
                        console.error('Error getting download URL:', error);
                    });
            });
        })
        .catch((error) => {
            console.error('Error listing files in folder:', error);
        })
}

function listFolders() {
    const listRef = ref(storage);
    loader.style.display = 'block';
    listAll(listRef)
        .then((res) => {
            const folderNames = new Set();
            res.prefixes.forEach((folderRef) => {
                folderNames.add(folderRef.name);
            });
            folderNames.forEach((folderName) => {
                createTestCard(folderName);
            });
        })
        .catch((error) => {
            console.error('Error listing folders:', error);
        })
        .finally(() => {
            loader.style.display = 'none';
        });
}

function deleteFolder(folderName) {
    return new Promise((resolve, reject) => {
        const folderRef = ref(storage, folderName);
        loader.style.display = 'block';
        listAll(folderRef)
            .then((res) => {
                const deletePromises = res.items.map((itemRef) => {
                    return deleteObject(itemRef)
                        .then(() => {
                            console.log('File deleted successfully');
                        })
                        .catch((error) => {
                            console.error('Error deleting file:', error);
                            reject(error);
                        });
                });
                Promise.all(deletePromises)
                    .then(() => {
                        document.querySelector(`input[value="${folderName}"]`).closest('.card-container').remove();
                        resolve();
                    })
                    .catch((error) => {
                        console.error('Error deleting all files:', error);
                        reject(error);
                    });
            })
            .catch((error) => {
                console.error('Error listing files for deletion:', error);
                reject(error);
            })
            .finally(() => {
                loader.style.display = 'none';
            });
    });
}

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
