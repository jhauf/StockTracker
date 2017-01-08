jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    return function(o) {
        var url = o.url;
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            o.url = YQL;
            o.dataType = 'json';
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            o.success = (function(_success){
                return function(data) {
                    if (_success) {
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }

                };
            })(o.success);
        }
        return _ajax.apply(this, arguments);
    };
})(jQuery.ajax);

let prices = [];

function pullPrice() {
  $.ajax({
      url: 'http://money.cnn.com/data/markets/sandp/',
      type: 'GET',
      success: function(res) {
          let result = $(res.responseText).find(".wsod_last").find("span")[0].innerHTML;
          let container = document.getElementById("container");
          if (prices.length < 1 || prices[prices.length - 1].result !== result) {
            let totalDate = new Date().toString().replace(" ", ", ").replace("GMT-0800", "")
            let date = totalDate.slice(0,-15);
            let time = totalDate.slice(-15);
            prices.push({result: result, date: date, time: time});
            container.innerHTML = `<span>` + `<li>Price</li>` + prices.map((price) => `<li>$${price.result}</li>`).join(" ") + `</span> <span>` +`<li>Date</li>` + prices.map((price) => `<li>${price.date}</li>`).join(" ") + `</span> <span>` +`<li>Time</li>` + prices.map((price) => `<li>${price.time}</li>`).join(" ") + `</span>`;
          }
      }
  });
}

setInterval(pullPrice, 1000);
