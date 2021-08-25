//创建多行字符串
function heredoc(fn) {
    return fn.toString().split('\n').slice(1,-1).join('\n') + '\n'
}

//字符串格式化
/*
调用方式：
    var info = "我喜欢吃{0}，也喜欢吃{1}，但是最喜欢的还是{0},偶尔再买点{2}。";
    var msg=String.format(info , "苹果","香蕉","香梨")
    alert(msg);
    输出:我喜欢吃苹果，也喜欢吃香蕉，但是最喜欢的还是苹果,偶尔再买点香梨。
*/
String.format = function() {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for ( var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

//小数点四舍五入
function mathRound(num, n) {
    var f = parseFloat(num);
    if (isNaN(f)) {
        return false;
    }
    f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); // n 幂
    var s = f.toString();
    var rs = s.indexOf('.'); //判定如果是整数，增加小数点再补0
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + n) {
        s += '0';
    }
    return s;
}

/* 使用正则表达式来判断字符串是否全为空 */
function isEmpty(test) {
    if(test.match(/^\s+$/)){
        return true;
    }
    if(test.match(/^[ ]+$/)){
        return true;
    }
    if(test.match(/^[ ]*$/)){
        return true;
    }
    if(test.match(/^\s*$/)){
        return true;
    } else {
        return false;
    }
}

//保留两位小数 浮点数四舍五入 位数不够 不补0
//console.log(fomatFloat(3.12645,2)); // 3.13
//console.log(typeof fomatFloat(3.1415926)); //number
function formatFloat(src,pos){
    return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}