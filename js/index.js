(function(){

    window.canvasLock = function(obj){

        this.width = obj.width;
        this.height = obj.height;
        this.chooseType = obj.chooseType;
        this.firstTime = true;
        if(localStorage.length === 0){
            localStorage.setItem('firstTime','true');
        }
    }

    canvasLock.prototype.buildDom = function(){
        var wrap = document.createElement('div');
        str = '<h4 id="title" class="title">绘制解锁图案</h4>';
        wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');

        var canvas = document.createElement('canvas');
        canvas.setAttribute('id','canvas');
        canvas.style.cssText = 'background-color: #305066;display: inline-block;margin-top: 15px;';

        wrap.innerHTML = str;
        wrap.appendChild(canvas);

        var width = this.width || 300;
        var height = this.height || 300;

        document.body.appendChild(wrap);

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        canvas.width = width;
        canvas.height = height;


    }

    canvasLock.prototype.init = function(){
        this.buildDom();
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.touchFlag = false;
        this.createCircle();
        this.bindEvent();
    }

    canvasLock.prototype.createCircle = function(){
        var n = this.chooseType;
        var count = 0;
        this.lastPoint = [];
        this.restPoint = [];
        this.arr = [];
        this.r = this.ctx.canvas.width / (2 + 4 * n);
        var r = this.r;
        for(var i = 0;i < n;i++){
            for(var j = 0;j < n;j++){
                count++
                var obj = {
                    x:j * 4 * r + 3 * r,
                    y:i * 4 * r + 3 * r,
                    index:count
                }
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }

        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        for(var i = 0;i<this.arr.length;i++){
            this.drawCircle(this.arr[i].x,this.arr[i].y)
        }
    }

    canvasLock.prototype.drawCircle = function(x,y){
        this.ctx.strokeStyle = '#CFE6FF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x,y,this.r,0,Math.PI*2,true);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    canvasLock.prototype.bindEvent = function(e){
        var self = this;

        this.canvas.addEventListener('touchstart',function(e){


            var po = self.getPosition(e);

            for(var i = 0;i <self.arr.length;i++){
                if(Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r){

                    self.touchFlag = true;

                    self.lastPoint.push(self.arr[i]);

                    self.restPoint.splice(i,1);
                    break;
                }
            }
        })

        this.canvas.addEventListener('touchmove',function(e){

            if(self.touchFlag){
                self.update(self.getPosition(e))
            }

        })

        this.canvas.addEventListener('touchend',function(e){
            if(self.touchFlag && localStorage['firstTime'] === 'false'){
                self.storePass(self.lastPoint);
                setTimeout(function(){
                    self.reset();
                },200)
            }else if(self.touchFlag && localStorage['firstTime'] === 'true'){
                self.createPass(self.lastPoint);
                setTimeout(function(){
                    self.reset();
                },200)
            }
        })

    }

    canvasLock.prototype.getPosition = function(e){

        var rect = e.currentTarget.getBoundingClientRect();

        var po = {
            x:(e.touches[0].clientX - rect.left),
            y:(e.touches[0].clientY - rect.top),
        }
        return po;
    }

    canvasLock.prototype.update = function(po){

        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);


        for(var i = 0;i<this.arr.length;i++){

            this.drawCircle(this.arr[i].x,this.arr[i].y);

        }

        this.drawPoint();
        this.drawLine(po);

        for(var i = 0;i < this.restPoint.length;i++){
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r){
                this.drawPoint();
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i,1);
                break;
            }
        }

    }

    canvasLock.prototype.drawPoint = function(){
        for(var i = 0;i<this.lastPoint.length;i++){
            this.ctx.fillStyle = '#CFE6FF';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    canvasLock.prototype.drawLine = function(po){

        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x,this.lastPoint[0].y);
        for(var i = 0;i < this.lastPoint.length;i++){
            this.ctx.lineTo(this.lastPoint[i].x,this.lastPoint[i].y)
        }
        this.ctx.lineTo(po.x,po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    }

    canvasLock.prototype.createPass = function(){
        var pass = '';
        for(var i = 0;i < this.lastPoint.length; i++){
            pass += this.lastPoint[i].index;
        }
        localStorage['pass'] = pass;
        localStorage['firstTime'] = 'false'
    }


    canvasLock.prototype.storePass = function(){
        if(this.checkPass()){
            document.getElementById('title').innerHTML = '解锁成功';
            this.drawStatusPoint('#2CFF26')
        }else{
            document.getElementById('title').innerHTML = '解锁失败';
            this.drawStatusPoint('red')
        }
    }

    canvasLock.prototype.checkPass = function(){
            p2 = '';

            for(var i = 0;i<this.lastPoint.length;i++){
                p2 +=this.lastPoint[i].index;
            }
            return localStorage['pass'] === p2;
    }

    canvasLock.prototype.drawStatusPoint = function(color){

        for(var i = 0;i<this.lastPoint.length;i++){
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.arc(this.lastPoint[i].x,this.lastPoint[i].y,this.r,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.stroke();
        }

    }

    canvasLock.prototype.reset = function(){
        this.createCircle();
    }
})()