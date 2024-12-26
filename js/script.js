import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBwVoNHZU4uG5DqKA-rT8X_adR7kIRCcR8",
    authDomain: "team-page-1321.firebaseapp.com",
    projectId: "team-page-1321",
    storageBucket: "team-page-1321.firebasestorage.app",
    messagingSenderId: "175896196388",
    appId: "1:175896196388:web:49b76903cf922549b5afb1",
    measurementId: "G-7514TVG9G9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 데이터 읽기 및 카드 생성
$("방명록내용").empty();
const querySnapshot = await getDocs(collection(db, "guest_book"));

querySnapshot.forEach((doc) => {

    let guest_book_name = doc.data().guest_book_name;
    let guest_book_content = doc.data().guest_book_content;
    let encrypted_password = "⭐".repeat(doc.data().encrypted_password);

    let tempHtml = `여기에 방명록 추가`;
    $("방명록내용").append(tempHtml);
});

$('guest_book_btn').onclick(async function(){
    const guestBookData = {
        guest_book_name: $("guest_book_name").val(),
        guest_book_content: $("guest_book_content").val(),
        guest_book_password: $("guest_book_password").val()
    };
    await saveGuestBook(guestBookData);
});

// 데이터 추가
async function saveGuestBook(guestBookData) {

    // title_input, comment_input, image_input id를 가진 HTML 요소에서 값을 가져와서 title, comment, image 변수에 저장해 주세요.
    let { guest_book_name, guest_book_content, guest_book_password } = guestBookData;
    let guest_book_timestamp = Date.now();

    const encrypted_password = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(guest_book_password)
    );

    const password_str = Array.from(new Uint8Array(encrypted_password))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    try {
        const docRef = await addDoc(collection(db, "guest_book"), {
            // 각각 담은 변수를 컬렉션 필드에 title, comment, image에 각각 넣어주세요.
            'guest_book_name': guest_book_name,
            'guest_book_content': guest_book_content,
            'guest_book_password': password_str,
            'guest_book_timestamp': guest_book_timestamp
        });

        alert("글이 성공적으로 등록 되었습니다!");
        window.location.reload();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}


//방명록 삭제
async function deleteGuestBook(guestBookId, inputPassword){
    try{
        //Firestore에서 해당 방명록 조회
        const doc = await db.collection('guest_book').doc(guestBookId).get();
        //만약 존재하지 않는다면
        if (!doc.exists) {
            console.error("Entry not found!");
            alert("해당 글을 찾을 수 없습니다.");
            return;
        }

        const data = doc.data();

        //입력된 비밀번호 암호화
        const input_password = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(inputPassword)
        );
        
        //암호화된 비밀번호 String형식 16진수로 변환
        const password_str = Array.from(new Uint8Array(inputPassword))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');

        //저장된 비밀번호와 비교
        if (data.password !== password_str) {
            console.error("Password mismatch!");
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        //비밀번호가 일치하면 삭제
        await db.collection('guest_book').doc(guestBookId).delete();
        console.log("Entry deleted successfully!");
        alert("글이 성공적으로 삭제되었습니다.");
    } catch (error) {
        console.error("Error deleting entry:", error);
        alert("글 삭제 중 오류가 발생했습니다.");
    }
}


//방명록 수정
async function updateGuestBook(guestBookId,inputPassword){
    try{
        //Firestore에서 해당 방명록 조회
        const doc = await db.collection('guest_book').doc(guestBookId).get();
        //만약 존재하지 않는다면
        if (!doc.exists) {
            console.error("Entry not found!");
            alert("해당 글을 찾을 수 없습니다.");
            return;
        }

        const guessBookData = doc.data();

        //입력된 비밀번호 암호화
        const input_password = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(inputPassword)
        );

        //암호화된 비밀번호 String형식 16진수로 변환
        const password_str = Array.from(new Uint8Array(inputPassword))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');

        //저장된 비밀번호와 비교
        if (data.password !== password_str) {
            console.error("Password mismatch!");
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        //비밀번호가 일치하면 해당 글을 input에 출력

    } catch (error) {
        console.error("Error deleting entry:", error);
        alert("글 삭제 중 오류가 발생했습니다.");
    }
}


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