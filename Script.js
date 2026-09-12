/* =========================================
   SCREEN NAVIGATION
========================================= */

function showScreen(screenId) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const target =
        document.getElementById(screenId);


    if (target) {

        target.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/* =========================================
   COMING SOON
========================================= */

function comingSoon(occasion) {

    alert(
        occasion +
        " gifts are coming soon! 🎁\n\n" +
        "For now, try Birthday."
    );

}


/* =========================================
   PHOTO UPLOAD
========================================= */

const photoInput =
    document.getElementById("photoInput");


photoInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                document
                    .getElementById("previewImage")
                    .src =
                    event.target.result;


                document
                    .getElementById("photoPreview")
                    .style.display =
                    "block";

            };


        reader.readAsDataURL(file);

    }
);


/* =========================================
   VOICE RECORDING
========================================= */

let mediaRecorder = null;

let audioChunks = [];

let recordedAudio = null;

let isRecording = false;


async function toggleRecording() {

    if (!isRecording) {

        try {

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true
                    });


            audioChunks = [];


            mediaRecorder =
                new MediaRecorder(stream);


            mediaRecorder.start();


            isRecording = true;


            document
                .getElementById("recordBtn")
                .classList.add("recording");


            document
                .getElementById("recordStatus")
                .textContent =
                "Recording... Click again to stop.";


            mediaRecorder.ondataavailable =
                function (event) {

                    audioChunks.push(
                        event.data
                    );

                };


            mediaRecorder.onstop =
                function () {

                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type: "audio/webm"
                            }
                        );


                    recordedAudio =
                        audioBlob;


                    const audioURL =
                        URL.createObjectURL(
                            audioBlob
                        );


                    const audioPreview =
                        document.getElementById(
                            "audioPreview"
                        );


                    audioPreview.src =
                        audioURL;


                    audioPreview.style.display =
                        "block";


                    document
                        .getElementById(
                            "recordStatus"
                        )
                        .textContent =
                        "Voice message recorded! 💗";


                    /*
                     * Stop microphone.
                     */

                    stream
                        .getTracks()
                        .forEach(
                            track => track.stop()
                        );

                };


        } catch (error) {

            alert(
                "Microphone access is required to record a voice message."
            );

        }


    } else {

        mediaRecorder.stop();

        isRecording = false;


        document
            .getElementById("recordBtn")
            .classList.remove("recording");

    }

}


/* =========================================
   CREATE GIFT
========================================= */

function createGift() {

    const photoFile =
        photoInput.files[0];


    const letter =
        document
            .getElementById("letterInput")
            .value
            .trim();


    /*
     * Make sure the user added something.
     */

    if (
        !photoFile &&
        !letter &&
        !recordedAudio
    ) {

        alert(
            "Please add at least one thing to your gift. 💗"
        );

        return;

    }


    /*
     * Generate unique ID.
     */

    const giftId =
        "gift-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8);


    const gift = {

        id: giftId,

        occasion: "birthday",

        letter: letter,

        photo: null,

        audio: null,

        createdAt:
            new Date().toISOString()

    };


    /*
     * We need to wait until
     * photo/audio are processed.
     */

    let photoDone =
        !photoFile;

    let audioDone =
        !recordedAudio;


    function finishSaving() {

        if (
            photoDone &&
            audioDone
        ) {

            saveGift(gift);

        }

    }


    /*
     * PHOTO
     */

    if (photoFile) {

        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                gift.photo =
                    event.target.result;

                photoDone = true;

                finishSaving();

            };


        reader.readAsDataURL(
            photoFile
        );

    }


    /*
     * AUDIO
     */

    if (recordedAudio) {

        const audioReader =
            new FileReader();


        audioReader.onload =
            function (event) {

                gift.audio =
                    event.target.result;

                audioDone = true;

                finishSaving();

            };


        audioReader.readAsDataURL(
            recordedAudio
        );

    }


    finishSaving();

}


/* =========================================
   SAVE GIFT
========================================= */

function saveGift(gift) {

    localStorage.setItem(
        gift.id,
        JSON.stringify(gift)
    );


    /*
     * Prototype share link.
     */

    const link =
        window.location.origin +
        window.location.pathname +
        "?gift=" +
        gift.id;


    document
        .getElementById("generatedLink")
        .value =
        link;


    showScreen("generated");

}


/* =========================================
   COPY LINK
========================================= */

async function copyLink() {

    const link =
        document
            .getElementById("generatedLink")
            .value;


    try {

        await navigator.clipboard
            .writeText(link);

    } catch (error) {

        const input =
            document
                .getElementById(
                    "generatedLink"
                );


        input.select();

        document.execCommand("copy");

    }


    const message =
        document
            .getElementById(
                "copyMessage"
            );


    message.style.display =
        "block";


    setTimeout(
        function () {

            message.style.display =
                "none";

        },
        2500
    );

}


/* =========================================
   OPEN GIFT
========================================= */

function openGift() {

    const input =
        document
            .getElementById(
                "giftLinkInput"
            )
            .value
            .trim();


    const error =
        document
            .getElementById(
                "receiveError"
            );


    let giftId = null;


    /*
     * Try to read URL.
     */

    try {

        const url =
            new URL(input);


        giftId =
            url.searchParams
                .get("gift");

    } catch (error) {

        /*
         * Allow gift ID directly.
         */

        if (
            input.startsWith("gift-")
        ) {

            giftId =
                input;

        }

    }


    if (!giftId) {

        error.style.display =
            "block";

        return;

    }


    /*
     * Retrieve gift.
     */

    const storedGift =
        localStorage.getItem(
            giftId
        );


    if (!storedGift) {

        error.style.display =
            "block";

        return;

    }


    error.style.display =
        "none";


    const gift =
        JSON.parse(storedGift);


    displayGift(gift);

}


/* =========================================
   DISPLAY GIFT
========================================= */

function displayGift(gift) {

    const photo =
        document.getElementById(
            "giftPhoto"
        );


    const letter =
        document.getElementById(
            "giftLetter"
        );


    const voice =
        document.getElementById(
            "giftVoice"
        );


    const audio =
        document.getElementById(
            "giftAudio"
        );


    /*
     * Reset elements.
     */

    photo.style.display =
        "none";

    letter.style.display =
        "none";

    voice.style.display =
        "none";


    /*
     * PHOTO
     */

    if (gift.photo) {

        photo.src =
            gift.photo;

        photo.style.display =
            "block";

    }


    /*
     * LETTER
     */

    if (gift.letter) {

        letter.textContent =
            gift.letter;

        letter.style.display =
            "block";

    }


    /*
     * AUDIO
     */

    if (gift.audio) {

        audio.src =
            gift.audio;

        voice.style.display =
            "block";

    }


    showScreen(
        "giftView"
    );

}


/* =========================================
   AUTOMATIC GIFT LINK
========================================= */

window.addEventListener(
    "DOMContentLoaded",
    function () {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const giftId =
            params.get("gift");


        if (!giftId) {
            return;
        }


        const storedGift =
            localStorage.getItem(
                giftId
            );


        if (!storedGift) {
            return;
        }


        const gift =
            JSON.parse(
                storedGift
            );


        displayGift(gift);

    }
);
