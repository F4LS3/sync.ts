const video = document.querySelector('#video');

const videoElement = document.createElement('video');
videoElement.style.visibility = 'hidden';
videoElement.volume = 0;

video.onchange = async () => {
    const file = video.files[0];
    console.log(file);

    if(!file) return;

    videoElement.src = URL.createObjectURL(file);
    await videoElement.play();

    let form = new FormData();
    form.append('video', file);
    form.append('duration', videoElement.duration * 1000);

    fetch('/settings/upload', {
        method: 'POST',
        body: form
    })
    .then(response => {
        console.log(response);
    });
};

videoElement.ondurationchange = (event) => {
};