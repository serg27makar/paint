var canv = document.getElementById("canv");
var ctx = canv.getContext("2d");			

var isDown = false;

var fillSwitch = false;

var scrolledTo =0;
var scrolled = 0;
var scrollScm = 0;

var inputTag = undefined;
var posY = 0;
var atrebTag;
var del;

var DRAW_CURVE = 1;
var DRAW_TEXT = 2;
var SET_LINE_WIDTH = 3;
var SET_LINE_COLOR = 4;
var DRAW_CIRCLE = 5;
var DRAW_LINE = 6;
var DRAW_RECT = 7;
var FILL_COLOR = 8;
var SET_FILL_COLOR = 9;
var SELECT = 10;

var operationList = document.getElementById('operationList');

var current_operation = DRAW_CURVE;
var all_operations = [];

document.onmouseup = up;
canv.onmousedown = down;
canv.onmousemove = move;

var op_curve = document.getElementById("op_curve");
var op_rect = document.getElementById("op_rect");
var op_line = document.getElementById("op_line");
var op_text = document.getElementById("op_text");
var op_circle = document.getElementById("op_circle");
var op_select = document.getElementById("op_select");

var op_fill_color = document.getElementById("op_fill_color");
var op_fill = document.getElementById("op_fill");
var op_line_width = document.getElementById("op_line_width");
var op_line_color = document.getElementById("op_line_color");

var file_save = document.getElementById("file_save");
var file_load = document.getElementById("file_load");

var select_operation = null;
var coordinates = {
    x: 0,
    y: 0
};

var textStyleType = {
    '0': "serif",
    '1': "sans serif",
    '2': "cursive",
    '3': "fantasy",
    '4': "monospace"
};

var operationType = {
    '1': "DRAW CURVE",
    '2': "DRAW TEXT",
    '3': "SET LINE WIDTH",
    '4': "SET LINE COLOR",
    '5': "DRAW CIRCLE",
    '6': "DRAW LINE",
    '7': "DRAW RECT",
    '8': "FILL COLOR",
    '9': "SET FILL COLOR"
};

function down(event){
	isDown = true;
	if (current_operation == SELECT && select_operation){
        coordinates.x = event.pageX;
        coordinates.y = event.pageY;
	    return;
    }
    switch(current_operation){
        case DRAW_CURVE:
        {
            // создаем новый обьект линии!
            // так как рисованая/кривая линия состоит с множества отрезков - будем сохранять их в массив
            // ВАЖНО - новый обьект линии будет создаваться каждый раз новый когда мы нажмем мышкой!!!
            var curve_object = {
                operation_code: DRAW_CURVE,
                curve: [{
                    x: event.pageX,
                    y: event.pageY
                }]
            };

            // добавляем наш обьект "линию" в массив операций
            all_operations.push(curve_object);
        }
            break;
        case DRAW_CIRCLE:
        {
            // создаем новый обьект круг!
            // опозиционировали центр круга
            var circle_object = {
                operation_code: DRAW_CIRCLE,
                circle: {
                    x: event.pageX,
                    y: event.pageY,
                    h: 0,
                    w: 0
                }
            };
            // добавляем наш обьект "круг" в массив операций
            all_operations.push(circle_object);
        }
            break;
        case DRAW_RECT:
        {
            var rect_object = {
                operation_code: DRAW_RECT,
                rect: {
                    x: event.pageX,
                    y: event.pageY,
                    h: 0,
                    w: 0
                }
            };
            all_operations.push(rect_object);
        }
            break;
        case DRAW_LINE:
        {
            var line_object = {
                operation_code: DRAW_LINE,
                line: {
                    sX: event.pageX,
                    sY: event.pageY,
                    fX: 0,
                    fY: 0
                }
            };
            all_operations.push(line_object);
        }
            break;
        case DRAW_TEXT:
		{
			var text = prompt("Введите текст");
			if(!text){
				// текст пустой
				return;
			}

            var sizeText = document.getElementById('textSise').value;
            var numberStyle = document.getElementById('styleType').selectedIndex;
            var styleText = textStyleType[numberStyle];
            var textParam = sizeText + "px " + styleText;
			// создаем новый обьект текста!
			// обьект текста имеет точку где спозиционирован текст!
			var text_object = {
				text: text,
				operation_code: DRAW_TEXT,
				position: {
					x: event.pageX,
					y: event.pageY,
                    style: textParam
				}
			// добавляем наш обьект "text" в массив операций
			};
			all_operations.push(text_object);
		}
		break;

	}
}

function up(){
	isDown = false;
    setTimeout(function () {renderList(true)},50);
    posY = 0;
}

function move(event){
    if(!isDown){ // ничего не делаем если мышка не нажата
        return;
    }
    if (current_operation == SELECT && select_operation){
        var newX = event.pageX - coordinates.x;
        var newY = event.pageY - coordinates.y;
        coordinates.x = event.pageX;
        coordinates.y = event.pageY;
        switch(select_operation.operation_code){
            case DRAW_CURVE:
            {
                // добавляем в массив отрезков еще одну точку!
                select_operation.curve.forEach(function (point) {
                    point.x += newX;
                    point.y += newY;
                })
            }
            break;
            case DRAW_CIRCLE: {
                select_operation.circle.x += newX;
                select_operation.circle.y += newY;
            }
            break;
            case DRAW_RECT: {
                select_operation.rect.x += newX;
                select_operation.rect.y += newY;

            }
                break;
            case DRAW_LINE: {
                select_operation.line.sX += newX;
                select_operation.line.sY += newY;
                select_operation.line.fX += newX;
                select_operation.line.fY += newY;

            }
                break;
            case DRAW_TEXT:
            {
                select_operation.position.x += newX;
                select_operation.position.y += newY;
            }
                break;
        }
        paint();
        return;
    }

    switch(current_operation){
		case DRAW_CURVE:
		{
			// берем последний обьект с массива.
			// это должен быть обьект линии - так как мы уже нажали кнопку мышки и он уже создался!!!
			var curve_object = all_operations[all_operations.length - 1];
			
			// добавляем в массив отрезков еще одну точку!
			curve_object.curve.push({
				x: event.pageX,
				y: event.pageY
			});
		}
		break;
        case DRAW_CIRCLE: {
            // берем с масива последний объект, координаты центра круга
            var circle_object = all_operations[all_operations.length - 1];
            // берем текущие координаты для радиуса круга
            var nowX = event.pageX;
            var nowY = event.pageY;
            //кординаты центра
            var centerX = circle_object.circle.x;
            var centerY = circle_object.circle.y;
            //берем радиус минусуя от центра поточные координаты
            // и преобразуя их через стандартную функцыю  Math.abs
            //на случай минусовых параметров
            var radX = Math.abs(centerX - nowX);
            var radY = Math.abs(centerY - nowY);
            circle_object.circle.h = radX;
            circle_object.circle.w = radY;

        }
            break;
        case DRAW_RECT: {
            var rect_object = all_operations[all_operations.length - 1];

            var stX = rect_object.rect.x;
            var stY = rect_object.rect.y;

            var nowX = event.pageX;
            var nowY = event.pageY;

            var endX = nowX - stX;
            var endY = nowY - stY;

            rect_object.rect.h = endX;
            rect_object.rect.w = endY ;
        }
            break;
        case DRAW_LINE: {
            // берем с масива последний объект
            var line_object = all_operations[all_operations.length - 1];

            line_object.line.fX = event.pageX;
            line_object.line.fY = event.pageY;

        }
        break;
        case DRAW_TEXT:
        {
            // для текста мы ничего не делаем..... его не надо рисовать :)
        }
            break;
	}
	paint();
}	

function paint(){
	ctx.clearRect(0,0,canv.width ,canv.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    fillSwitch = false;

    // проходим по КАЖДОЙ операции
	for(var i = 0; i < all_operations.length; i++){	
	
		var operation = all_operations[i];

		// определяем какая тип операции
		switch(operation.operation_code){
			case DRAW_CURVE:
			{
				// рисуем ВСЮ линию!!!
				ctx.beginPath();

				// берем первую точку с массива
				var first_point = operation.curve[0];
				ctx.moveTo(first_point.x-8, first_point.y-8);

				// берем все остальные точки с массива				
				for(var j = 1; j < operation.curve.length; j++){
					var next_point = operation.curve[j];
					ctx.lineTo(next_point.x-8, next_point.y-8);
				}
				// завершаем рисование линии
				ctx.stroke()				
			}
			break;
			case DRAW_TEXT:
			{
                ctx.font = operation.position.style;
                var x = operation.position.x-8;
				var y = operation.position.y-8;
				ctx.beginPath();
                if(fillSwitch) {
                    ctx.fillText(operation.text, x, y);
                }
                ctx.strokeText(operation.text, x, y);
				ctx.stroke();
			}
			break;
            case DRAW_CIRCLE:
            {
                // берем с масива последний объект, координаты центра круга
                var centerX = operation.circle.x;
                var centerY = operation.circle.y;
                var radX = operation.circle.h;
                var radY = operation.circle.w;
                ctx.beginPath();
                ctx.ellipse(centerX,centerY,radX,radY, 0, 0, 6.7);
                if(fillSwitch) {
                    ctx.fill();
                }
                ctx.stroke();
            }
                break;
            case DRAW_RECT:
            {
                var startX = operation.rect.x;
                var startY = operation.rect.y;
                var endX = operation.rect.h;
                var endY = operation.rect.w;
                ctx.beginPath();
                if(fillSwitch) {
                    ctx.fillRect(startX, startY, endX, endY);
                }
                ctx.strokeRect(startX, startY, endX, endY);
            }
                break;
            case DRAW_LINE:
            {
                var sX = operation.line.sX;
                var sY = operation.line.sY;
                var fX = operation.line.fX;
                var fY = operation.line.fY;
                ctx.beginPath();
                ctx.moveTo(sX-8, sY-8);
                ctx.lineTo(fX-8, fY-8);
                ctx.stroke();
            }
            break;
            case SET_LINE_WIDTH:
            {
                ctx.lineWidth = operation.line_width;
            }
			break;
            case SET_LINE_COLOR:
            {
                ctx.strokeStyle = operation.line_color;
            }
                break;
            case SET_FILL_COLOR:
            {
                ctx.fillStyle = operation.fill_color;
            }
                break;
            case FILL_COLOR:
            {
                fillSwitch = operation.fillSwitch;
            }
			break;
		}
	}
}

function renderList(load) {
    operationList.innerHTML = "";
    for(var i = 0; i < all_operations.length; i++){
        var text = document.createElement('p');
        del = document.createElement('button');
        text.setAttribute('data_index',i);
        del.setAttribute('del_index',i);
        var newVar = all_operations[i];
        if ( current_operation == SELECT && select_operation == newVar
            &&newVar.operation_code != 3 &&newVar.operation_code != 4
            &&newVar.operation_code != 8 &&newVar.operation_code != 9){
            text.style.color = "red";
        }
        var pOperation = newVar.operation_code;
        text.innerHTML = (i+1) + " : " + operationType[pOperation];
        operationList.appendChild(text);
        if (newVar.operation_code != 3 &&newVar.operation_code != 4
            &&newVar.operation_code != 8 &&newVar.operation_code != 9){
            text.appendChild(del);
        }
        del.id = "del";
        text.addEventListener('click',selectItem);
        del.onclick = string_delete;
    }
    if(!load) {
        operationList.scrollTo({top: operationList.scrollHeight - operationList.clientHeight, left: 0});
    }
}
function selectItem (event) {
    var index = event.target.getAttribute('data_index');
    select_operation = all_operations[index];
}

operationList.onmousedown = function(event){
    isDown = false;
    inputTag = event.target;
    if(inputTag.id == 'del'){
        return;
    }
    scrolledTo = operationList.scrollTop;
    atrebTag = event.target.getAttribute('data_index');
    if(inputTag!=operationList) {
        inputTag.style.position = "relative";
        posY = event.clientY;
        isDown = true
    }
};
operationList.onmousemove = function(event){
    if(isDown){
        scrolled = operationList.scrollTop;
        if(scrolled != scrolledTo){
            scrollScm  +=  scrolled - scrolledTo
        };
        inputTag.style.top = (event.clientY - posY + scrollScm) + "px";
        scrolledTo = scrolled;
    }
};
operationList.onmouseup = function(event){
    var newAtrebTag = event.pageY+operationList.scrollTop;
    newAtrebTag = Math.floor(newAtrebTag/(event.target.offsetHeight + 2));
    if (newAtrebTag >= all_operations.length ){
        newAtrebTag = all_operations.length-1;
    }
    var spl = all_operations[atrebTag];
    all_operations.splice(atrebTag,1);
    all_operations.splice(newAtrebTag,0,spl);
    isDown = false;
    scrolledTo =0;
    scrolled = 0;
    scrollScm = 0;
    return;
}

op_curve.onclick = function(){
    current_operation = DRAW_CURVE;
    isDown = false;
};
op_rect.onclick = function(){
    current_operation = DRAW_RECT;
    isDown = false;
};
op_line.onclick = function(){
    current_operation = DRAW_LINE;
    isDown = false;
};
op_circle.onclick = function(){
    current_operation = DRAW_CIRCLE;
    isDown = false;
};
op_text.onclick = function(){
    current_operation = DRAW_TEXT;
};

op_select.onclick = function(){
    current_operation = SELECT;
    isDown = false;
};
function string_delete(event){
    var index = event.target.getAttribute('del_index');
    all_operations.splice(index,1);
    paint();
    isDown = false;
};

op_line_width.onchange = function(event){
	var line_width_operation = {
		operation_code: SET_LINE_WIDTH,
		line_width: event.target.value
	};
	all_operations.push(line_width_operation);
};
op_line_color.onchange = function(event){
    var line_color_operation ={
        operation_code: SET_LINE_COLOR,
        line_color: event.target.value
    };
    all_operations.push(line_color_operation);
};

op_fill.onchange = function(event){
    var fill_color_operation ={
        operation_code: SET_FILL_COLOR,
        fill_color: event.target.value
    };
    all_operations.push(fill_color_operation);
};
op_fill_color.onchange = function(){
    var fill_color = {
        operation_code: FILL_COLOR,
        fillSwitch: op_fill_color.checked
  	};
    fillSwitch = op_fill_color.checked;
    all_operations.push(fill_color);
};

file_load.onclick = function(){
    var boxLoad = document.createElement("div");
    boxLoad.id = "boxLoad";
    requestData('/api/list-data', null, function(loadedData){
        var files = JSON.parse(loadedData);
        for (i = 0; i < files.length;i++){
            var pTag = document.createElement("p");
            pTag.innerHTML = files[i];
            pTag.onclick =openFile;
            boxLoad.appendChild(pTag);

		}
        document.body.appendChild(boxLoad);
        clrScr();
   });

};
function clrScr(){
    function closeDialog(event){
        var boxLoad = document.getElementById("boxLoad");
        if(boxLoad && !isEqualElement (event.target,boxLoad)){
            document.removeEventListener("click",closeDialog);
            document.body.removeChild(boxLoad);
        }
    }
	document.addEventListener("click",closeDialog);
}

function resetpainter() {
    var line_color_operation ={
        operation_code: SET_LINE_COLOR,
        line_color: "#000000"
    };
    all_operations.push(line_color_operation);
    var fill_color_operation ={
        operation_code: SET_FILL_COLOR,
        line_color: "#000000"
    };
    all_operations.push(fill_color_operation);
    var line_width_operation = {
        operation_code: SET_LINE_WIDTH,
        line_width: 1
    };
    all_operations.push(line_width_operation);
}

file_save.onclick = function(){
    var saveName = prompt("input file 000 name");
    var paintData = {
        saveName: saveName,
        data: all_operations

    };
    var data = JSON.stringify(paintData);

    requestData('/api/save-data', data, function(){
        console.log('Data was saved')
    });
};

function openFile(event) {
    console.log(event);
    var fileName = event.currentTarget.innerHTML;
    requestData('/api/load-data', fileName, function(loadedData){
        all_operations = JSON.parse(loadedData);
        paint();
        resetpainter();
        renderList();
	});

    var boxLoad = document.getElementById("boxLoad");
    document.body.removeChild(boxLoad);
}

function isEqualElement(checkNode, node){
    if(node === checkNode){
        return true;
    }
    for(var i = 0; i < node.children.length; i++){
        if(isEqualElement(checkNode, node.children[i])){
            return true;
        }
    }
    return false;
}
