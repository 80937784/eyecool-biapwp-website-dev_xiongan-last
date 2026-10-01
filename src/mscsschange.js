function isIE() { 
    if (!!window.ActiveXObject || "ActiveXObject" in window)
     return true;
     else
     return false;
}
if(isIE()) {
    require('@/assets/styles/ms-other.scss')
}else {
    require('@/assets/styles/webkit-other.scss')
}