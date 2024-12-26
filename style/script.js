document.getElementById('guestbook-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    if (name && message) {
        const entryList = document.getElementById('entries-list');

        const newEntry = document.createElement('li');
        newEntry.innerHTML = `<strong>${name}</strong>: ${message}`;

        entryList.appendChild(newEntry);

        // 폼 초기화
        document.getElementById('guestbook-form').reset();
    } else {
        alert('이름과 메시지를 모두 입력해주세요!');
    }
});
