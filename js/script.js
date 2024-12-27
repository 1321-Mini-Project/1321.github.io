import {initializeApp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {collection, addDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {getDocs} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {doc, getDoc, deleteDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

function setMode(mode) {
    if (mode === "light") {
        $(".card").css("background-color", "#ffffff");
        $(".card").css("color", "#000000");
        $("body").css("background-color", "#f8f9fa");
        $(".title").css("color", "#000000");
    } else if (mode === "dark") {
        $(".card").css("background-color", "#333333");
        $(".card").css("color", "#ffffff");
        $("body").css("background-color", "#222222");
        $(".title").css("color", "#ffffff");
    }
    localStorage.setItem("theme", mode); // 현재 모드 상태 저장
}

document.addEventListener("DOMContentLoaded", function () {
    const savedMode = localStorage.getItem("theme") || "light"; // 기본값은 "light"
    setMode(savedMode);
});


// 라이트 모드
$("#lightBtn").click(function () {
    setMode("light");
});

// 다크 모드 카드 배경색
$("#darkBtn").click(function () {
    setMode("dark");
});


//팀 소개 버튼 클릭
$("#teamIntroBtn").click(function () {
    const $teamName = $("#teamName");
    const $teamIntro = $("#teamIntro");

    // 1초 동안 팀 이름 숨기기
    $teamName.fadeOut(500, function () {
        // 팀 소개 표시
        $teamIntro.fadeIn(500, function () {
            // 3초 뒤 팀 소개 숨기기
            setTimeout(() => {
                $teamIntro.fadeOut(500, function () {
                    // 다시 팀 이름 표시
                    $teamName.fadeIn(500);
                });
            }, 2000);
        });
    });
});

// 데이터 읽기 및 카드 생성
$(".guest_book_container").empty();
const q = query(
    collection(db, "guest_book"), // 컬렉션 이름
    orderBy("guest_book_timestamp", "desc") // timestamp를 기준으로 내림차순 정렬
);
const querySnapshot = await getDocs(q);




querySnapshot.forEach((doc) => {

    let guest_book_name = doc.data().guest_book_name;
    let guest_book_content = doc.data().guest_book_content;
    let guest_book_id = doc.id;

    let tempHtml = ` 
            <div class="guestBookCont">
                <div id="guestBookInfo" class="row g-3">
                    <input type="hidden" class="form-control" id="passwd" placeholder="비밀번호">
                    <div class="col-sm-2">
                        <p class="guest_book_name" id="guest_book_name_${guest_book_id}">${guest_book_name}</p>
                    </div>
                    <div class="col-sm-6">
                        <p class="guest_book_content" id="guest_book_content_${guest_book_id}">${guest_book_content}</p>
                    </div>
                    <div class="col-sm-2">
                        <input type="password" class="form-control" id="guest_book_content_password_${guest_book_id}" placeholder="비밀번호(숫자 6자리)">
                    </div>
                    <div class="col-sm-2">
                        <button class="btn btn-primary mb-3" id="guest_book_modi" data-id="${guest_book_id}">수정</button>
                        <button class="btn btn-secondary mb-3 " id="guest_book_del" data-id="${guest_book_id}">삭제</button>
                    </div>
                </div>
            </div>`;
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

$(document).on("click", "#guest_book_modi", async function (event) {
    const guestBookDiv = event.target.closest(`.guestBookCont`);// 클릭된 항목 가져오기
    const guestBookId = $(this).data("id");
    const guestBookPw = $(`#guest_book_content_password_${guestBookId}`).val();
    //길이 확인
    if (guestBookPw.length !== 6) {
        alert("비밀번호의 길이는 6자리여야 합니다!")
        return false;
    }

    //숫자인지 확인
    for (let i = 0; i < guestBookPw.length; i++) {
        const char = guestBookPw[i];
        if (char < '0' || char > '9') {
            alert("비밀번호는 숫자여야 합니다!")
            return false;
        }
    }


    if (await matchPassword(guestBookId, guestBookPw)) {
        //비밀번호가 일치하면 해당 글을 input에 출력
        await updateGuestBook(guestBookDiv, guestBookId);
    }
});

$(document).on("click", "#guest_book_del", async function () {
    const guestBookId = $(this).data("id");
    const guestBookPw = $(`#guest_book_content_password_${guestBookId}`).val();

    if (guestBookPw === "") {
        alert("비밀번호를 입력하세요.");
        return;
    }
    //길이 확인
    if (guestBookPw.length !== 6) {
        alert("비밀번호의 길이는 6자리여야 합니다!")
        return;
    }

    //숫자인지 확인
    for (let i = 0; i < guestBookPw.length; i++) {
        const char = guestBookPw[i];
        if (char < '0' || char > '9') {
            alert("비밀번호는 숫자여야 합니다!")
            return;
        }
    }


    if (await matchPassword(guestBookId, guestBookPw)) {
        //비밀번호가 일치하면 해당 글을 input에 출력
        deleteGuestBook(guestBookId);
    }
});

async function matchPassword(guestBookId, guestBookPw){
    try {
        //Firestore에서 해당 방명록 조회
        const docRef = doc(db, "guest_book", guestBookId);
        const docSnap = await getDoc(docRef);
        //만약 존재하지 않는다면
        if (!docSnap.exists) {
            console.error("guest book not found!");
            alert("해당 글을 찾을 수 없습니다.");
            return false;
        }
        const guestBookData = docSnap.data();

        //입력된 비밀번호 암호화
        let input_password = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(guestBookPw)
        );

        //암호화된 비밀번호 String형식 16진수로 변환
        const password_str = Array.from(new Uint8Array(input_password))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');

        //저장된 비밀번호와 비교
        if (guestBookData.guest_book_password !== password_str) {
            console.error("password mismatch!");
            alert("비밀번호가 일치하지 않습니다.");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting :", error);
        alert("글 삭제 중 오류가 발생했습니다.");
    }
}

// 데이터 추가
async function saveGuestBook(guestBookData) {

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
            'guest_book_name': guest_book_name,
            'guest_book_content': guest_book_content,
            'guest_book_password': password_str,
            'guest_book_timestamp': guest_book_timestamp
        });

        alert("글이 성공적으로 등록 되었습니다!");
        window.location.reload();
    } catch (e) {
        console.error("Error adding : ", e);
    }
}


//방명록 삭제
async function deleteGuestBook(guestBookId) {
    try {
        //Firestore에서 해당 방명록 조회
        const docRef = doc(db, "guest_book", guestBookId);
        const docSnap = await getDoc(docRef);
        //만약 존재하지 않는다면
        if (!docSnap.exists) {
            console.error("guest book not found!");
            alert("해당 글을 찾을 수 없습니다.");
            return;
        }

        await deleteDoc(doc(db, "guest_book", guestBookId));
        alert("글이 성공적으로 삭제되었습니다.");
        window.location.reload();
    } catch (error) {
        console.error("Error deleting :", error);
        alert("글 삭제 중 오류가 발생했습니다.");
    }
}


//방명록 수정
async function updateGuestBook(guestBookDiv, guestBookId) {

    const contentElem = guestBookDiv.querySelector(`#guest_book_content_${guestBookId}`);

    if (!contentElem) {
        console.error(`guest_book_content_${guestBookId} not found.`);
        return;
    }

    // 현재 텍스트 가져오기
    const currentContent = contentElem.textContent;

    // 새 input 태그 생성
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "form-control";
    inputElement.id = `guest_book_content_input_${guestBookId}`;
    inputElement.value = currentContent;

    // input 태그를 기존 p 태그로 교체
    const contentParentNode = contentElem.parentNode;
    contentParentNode.replaceChild(inputElement, contentElem);
    
    // 비밀 번호 비활성화
    const passwordField = guestBookDiv.querySelector(`#guest_book_content_password_${guestBookId}`);
    if (passwordField) {
        passwordField.disabled = true;
    }

    // 수정 버튼을 저장 버튼으로 변경
    const editButton = guestBookDiv.querySelector(`#guest_book_modi[data-id="${guestBookId}"]`);
    const btnParentNode = editButton.parentNode;
    const saveButton = document.createElement("button");
    saveButton.textContent = "저장";
    saveButton.className = "btn btn-success mb-3";
    saveButton.id = "guest_book_save";
    saveButton.dataset.id = guestBookId;
    btnParentNode.replaceChild(saveButton, editButton);
    // 저장 버튼 클릭 이벤트 등록
    saveButton.addEventListener("click", () => saveEdits(guestBookDiv, guestBookId));
}

async function saveEdits(guestBookDiv, guestBookId) {
    // input 태그 가져오기
    const inputElement = guestBookDiv.querySelector(`#guest_book_content_input_${guestBookId}`);
    if (!inputElement) {
        console.error(`guestBookId ${guestBookId} not found.`);
        return;
    }

    // 새 내용 가져오기
    const newContent = inputElement.value.trim();
    if (!newContent) {
        alert("내용을 입력해야 합니다.");
        return;
    }

    // Firestore 데이터베이스에 업데이트
    updateFirestoreGuestBook(guestBookId, newContent);
}

async function updateFirestoreGuestBook(guestBookId, newContent) {
    let guest_book_timestamp = new Date().toLocaleString();

    try {
        const docRef = doc(db, "guest_book", guestBookId);
        await updateDoc(docRef, {
            guest_book_content: newContent,
            guest_book_timestamp: guest_book_timestamp,
        });

        alert("글 수정이 완료 되었습니다!");
        window.location.reload();
    } catch (error) {
        alert("Firestore 업데이트 중 오류가 발생했습니다.");
    }
}