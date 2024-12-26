import {initializeApp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {collection, addDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {getDocs} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
$(".guest_book_container").empty();
const querySnapshot = await getDocs(collection(db, "guest_book"));

querySnapshot.forEach((doc) => {

    let guest_book_name = doc.data().guest_book_name;
    let guest_book_content = doc.data().guest_book_content;
    let encrypted_password = "⭐".repeat(doc.data().encrypted_password);

    let tempHtml = `여기에 방명록 추가`;
    $(".guest_book_container").append(tempHtml);
});

$('#guest_book_save_btn').click(async function () {

    let guest_book_name = $("#guest_book_name").val();
    let guest_book_content = $("#guest_book_content").val();
    let guest_book_password = $("#guest_book_password").val();
    let guest_book_timestamp = new Date().toLocaleString()

    if (!guest_book_name || !guest_book_content || !guest_book_password) {
        alert("모든 내용을 입력해 주세요!")
        return;
    }

    //길이 확인
    if (guest_book_password.length !== 6) {
        alert("비밀번호의 길이는 6자리여야 합니다!")
        return false;
    }

    //숫자인지 확인
    for (let i = 0; i < guest_book_password.length; i++) {
        const char = guest_book_password[i];
        if (char < '0' || char > '9') {
            alert("비밀번호는 숫자여야 합니다!")
            return false;
        }
    }

    const guestBookData = {
        guest_book_name: guest_book_name,
        guest_book_content: guest_book_content,
        guest_book_password: guest_book_password,
        guest_book_timestamp: guest_book_timestamp
    };
    await saveGuestBook(guestBookData);
});

$('#guest_book_edit_btn').click(async function () {
    const guestBookDiv = event.target.closest(".guestbook_entry"); // 클릭된 항목 가져오기
    const guestBookId = entryDiv.dataset.id;
    let input_password = $("guest_book_edit_pw");
    try {
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
        input_password = await crypto.subtle.digest(
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
        await updateGuestBook(guestBookDiv, guestBookId, password_str);

    } catch (error) {
        console.error("Error deleting entry:", error);
        alert("글 삭제 중 오류가 발생했습니다.");
    }
});

// 데이터 추가
async function saveGuestBook(guestBookData) {

    // title_input, comment_input, image_input id를 가진 HTML 요소에서 값을 가져와서 title, comment, image 변수에 저장해 주세요.
    let {guest_book_name, guest_book_content, guest_book_password, guest_book_timestamp} = guestBookData;

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
async function deleteGuestBook(guestBookId, inputPassword) {
    try {
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
async function updateGuestBook(guestBookDiv, guestBookId) {

    const nameElem = guestBookDiv.querySelector(".guestbook_name");
    const contentElem = guestBookDiv.querySelector(".guestbook_content");

    // 기존 텍스트를 입력 필드로 변환
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = nameElem.textContent;

    const contentInput = document.createElement("textarea");
    contentInput.textContent = contentElem.textContent;

    // 기존 내용을 교체
    guestBookDiv.replaceChild(nameInput, nameElem);
    guestBookDiv.replaceChild(contentInput, contentElem);

    // 수정 버튼을 저장 버튼으로 변경
    const saveButton = document.createElement("button");
    saveButton.textContent = "저장";
    saveButton.classList.add("save_button");

    const editButton = entryDiv.querySelector(".edit_button");
    guestBookDiv.replaceChild(saveButton, editButton);

    // 저장 버튼 클릭 이벤트 등록
    saveButton.addEventListener("click", () => saveEdits(guestBookDiv, guestBookId, nameInput, contentInput, password_str));
}

async function saveEdits(guestBookDiv, guestBookId, nameInput, contentInput, password_str) {
    const updatedName = nameInput.value.trim();
    const updatedContent = contentInput.value.trim();

    try {
        // Firestore에서 해당 항목만 업데이트
        await db.collection("guest_book").doc(guestBookId).update({

            guest_book_name: updatedName,
            guest_book_content: updatedContent,
            guest_book_password: password_str,
            guest_book_timestamp: new Date().toLocaleString()
        });

        // 입력 필드를 다시 텍스트로 변경
        const nameElem = document.createElement("p");
        nameElem.textContent = updatedName;
        nameElem.classList.add("guestbook_name");

        const contentElem = document.createElement("p");
        contentElem.textContent = updatedContent;
        contentElem.classList.add("guestbook_content");

        // 입력 필드 교체
        guestBookDiv.replaceChild(nameElem, nameInput);
        guestBookDiv.replaceChild(contentElem, contentInput);

        // 저장 버튼을 다시 수정 버튼으로 변경
        const editButton = document.createElement("button");
        editButton.textContent = "수정";
        editButton.classList.add("edit_button");

        const saveButton = guestBookDiv.querySelector(".save_button");
        guestBookDiv.replaceChild(editButton, saveButton);

        alert("수정이 완료되었습니다!");
    } catch (error) {
        console.error("Error updating document: ", error);
        alert("수정 중 오류가 발생했습니다.");
    }
}

/*
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
*/


//저장
$(document).on("click", ".del", function () {
    $(this).closest("#guestBookInfo").remove();
});

function save() {
    let inputName = $("#inputName").val();
    let inputCont = $("#inputCont").val();

    let temp = `
        <div id="guestBookCont">
            <div id="guestBookInfo" class="row g-3">
                <input type="hidden" class="form-control" id="inputpass" placeholder="비밀번호" >
                <div class="col-sm-3">
                    <label for="inputPassword2" class="visually-hidden">name</label>
                    <input type="text" class="form-control" id="inputName" placeholder="닉네임"  value="${inputName}">
                </div>
                <div class="col-sm-7">
                    <label for="inputPassword2" class="visually-hidden">text</label>
                    <input type="text" class="form-control" id="inputCont" placeholder="내용 작성"  value="${inputCont}">
                </div>
                <div class="col-sm-2">
                    <button class="btn btn-primary mb-3 saveBtn" id="modi" data-bs-toggle="modal" data-bs-target="#pwdModal">수정</button>
                    <button class="btn btn-secondary mb-3 del" id="del" data-bs-toggle="modal" data-bs-target="#pwdModal">삭제</button>
                </div>
            </div>
        </div>`;

    $(".cont").append(temp);
}