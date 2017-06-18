/**
 * Created by yuli on 2017/6/16 0016.
 */
function compile(text){
    var text = text || document.getElementById("content").value;
    var converter = new showdown.Converter();
    var html = converter.makeHtml(text);
    document.getElementById("result").innerHTML = html;
}
window.onload = function(){
    var text =document.getElementById("content");
    if(text){
        var textHtml = text.textContent.trim();
        compile(textHtml)
    }
};