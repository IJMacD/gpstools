GPSTools.Graph = (function(){
  var gutterWidth = 35,
      mark,
      selectionStart,
      selectionEnd,
      drawGraph = function(id, data, options){
        options = $.extend({
          color: 'black',
          filled: false
        }, options);

        $('#'+id).show();
        var graph;
        if(options.type == "bar")
          graph = new RGraph.Bar(id, data);
        else
          graph = new RGraph.Line(id, data);

        if(options.overlay){
          graph.Set('chart.yaxispos', 'right');
          graph.Set('chart.background.grid.color', 'rgba(0,0,0,0)');
        }
        else {
          graph.Set('chart.background.barcolor1', 'white');
          graph.Set('chart.background.barcolor2', 'white');
          graph.Set('chart.background.grid.color', 'rgba(238,238,238,1)');
        }
        graph.Set('chart.colors', [options.color]);
        graph.Set('chart.linewidth', 1);
        graph.Set('chart.filled', options.filled);
        graph.Set('chart.hmargin', 1);
        graph.Set('chart.gutter.left', gutterWidth);
        graph.Set('chart.gutter.right', gutterWidth);
        graph.Set('chart.gutter.top', gutterWidth);
        graph.Set('chart.gutter.bottom', gutterWidth);
        if(options.negative)
          graph.Set('chart.xaxispos', 'center');
        if(options.labels)
          graph.Set('chart.labels', options.labels);
        graph.Draw();
        RGraph.ObjectRegistry.Clear();
      };

  return {
    drawLine: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'line';
      drawGraph(id, data, color);
    },
    drawFilled: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'line';
      color.filled = true;
      drawGraph(id, data, color);
    },
    drawBar: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'bar';
      color.filled = true;
      drawGraph(id, data, color);
    },
    clear: function(id){
      RGraph.Clear($('#'+id)[0]);
    },
    getPosition: function(id,x){
      var canvas = $('#'+id)[0],
          width = canvas.width,
          fracX = (x - gutterWidth) / (width - gutterWidth * 2);
      return fracX;
    },
    drawAnnotations: function(id){
      var canvas = $('#'+id)[0],
          ctx = canvas.getContext('2d'),
          height = canvas.height;

      if(mark){
        ctx.strokeWidth = "2";
        ctx.strokeStyle = "#ff0000";
        ctx.beginPath();
        ctx.moveTo(mark, gutterWidth);
        ctx.lineTo(mark, height - gutterWidth);
        ctx.stroke();
      }

      if(selectionStart){
        ctx.fillStyle = "rgba(255,42,42,0.6)";
        ctx.fillRect(selectionStart,gutterWidth,selectionEnd-selectionStart,height-gutterWidth*2);
      }
    },
    mark: function(id,x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        mark = x;
      }
      return pos;
    },
    startSelection: function(id, x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        selectionStart = x;
      }
    },
    endSelection: function(id, x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        selectionEnd = x;
      }
    },
    clearSelection: function(){
      selectionStart = selectionEnd = 0;
    },
    getSelectionStart: function(id){
      return GPSTools.Graph.getPosition(id,selectionStart);
    },
    setSelectionStart: function(id,fraction){
      var canvas = $('#'+id)[0],
          width = canvas.width;
      selectionStart = fraction * (width - gutterWidth * 2) + gutterWidth;
    },
    getSelectionEnd: function(id){
      return GPSTools.Graph.getPosition(id,selectionEnd);
    },
    setSelectionEnd: function(id,fraction){
      var canvas = $('#'+id)[0],
          width = canvas.width;
      selectionEnd = fraction * (width - gutterWidth * 2) + gutterWidth;
    }
  }
}());
