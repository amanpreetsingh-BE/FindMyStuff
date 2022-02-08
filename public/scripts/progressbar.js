let progressBar = document.querySelector('#progress-bar');
let progressBar2 = document.querySelector('#progress-bar2');

let progressBar3 = document.querySelector('#progress-bar3');
let progressBar4 = document.querySelector('#progress-bar4');

function updateProgressBar(){
    progressBar.style.height= `${getScrollPercentage()}%`
    progressBar2.style.height= `${getScrollPercentage2()}%`
    progressBar3.style.width= `${getScrollPercentage()}%`
    progressBar4.style.width= `${getScrollPercentage2()}%`
    requestAnimationFrame(updateProgressBar)
}

function getScrollPercentage(){
   if(window.scrollY > window.innerHeight-96){
        return Math.min(( (((window.scrollY)-(window.innerHeight-96))/400) *100),100)
    }
    else{
        return 0;
    }
}

function getScrollPercentage2(){
    if(window.scrollY > (window.innerHeight+305)){
        return Math.min(( (((window.scrollY-404)-(window.innerHeight-96))/404) *100),100)
    }
    else{
        return 0;
    }
}

updateProgressBar()