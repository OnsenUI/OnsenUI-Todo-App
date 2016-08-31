
var style = document.createElement('style');
style.innerHTML = [
  '.text-input--material.focused {',
  'background-image: -webkit-gradient(linear, left top, left bottom, from(#009688), to(#009688)), -webkit-gradient(linear, left bottom, left top, color-stop(1px, transparent), color-stop(1px, #afafaf));',
  'background-image: -webkit-linear-gradient(#009688, #009688), -webkit-linear-gradient(bottom, transparent 1px, #afafaf 1px);',
  'background-image: -moz-linear-gradient(#009688, #009688), -moz-linear-gradient(bottom, transparent 1px, #afafaf 1px);',
  'background-image: -o-linear-gradient(#009688, #009688), -o-linear-gradient(bottom, transparent 1px, #afafaf 1px);',
  'background-image: linear-gradient(#009688, #009688), linear-gradient(to top, transparent 1px, #afafaf 1px);',
  '-webkit-animation: material-text-input-animate 0.3s forwards;',
  '-moz-animation: material-text-input-animate 0.3s forwards;',
  '-o-animation: material-text-input-animate 0.3s forwards;',
  'animation: material-text-input-animate 0.3s forwards;'
].join('');

var pointer = ons._util.create('div', {
  zIndex: 9999999,
  position: 'absolute',
  width: '20px',
  height: '20px',
  backgroundColor: '#000',
  opacity: 0,
  borderRadius: '100%',
  border: '2px solid #FFF',
  transition: 'opacity .08s ease-in-out'
});

ons.ready(function() {
  document.body.appendChild(style);
  document.body.appendChild(pointer);

  var lock = function() {
    myApp.userInteraction = true;
    Array.prototype.forEach.call(document.querySelectorAll('.text-input--material.focused'), function(el) {
      el.classList.remove('focused');
    });
  };

  var unlock = function() {
    myApp.userInteraction = false;
    myApp.delay(2000).then(function() {
      if (!myApp.looping) {
        myApp.showcase();
      }
    }).catch(function(){});
  };

  document.addEventListener('mouseenter', lock);
  document.addEventListener('mouseleave', unlock);
  document.addEventListener('visibilitychange', function (event) {
    if (document.visibilityState === 'hidden') {
      lock();
    } else if (myApp.userInteraction) {
      unlock();
    }
  });

  myApp.delay(1000).then(myApp.showcase).catch(function(){});
});


myApp.showcase = function () {
  var simRipple = (function() {
    var active = false;
    return function(el) {
      if (active) {
        active = false;
      } else {
        active = true;
        var rect = el.getBoundingClientRect();
        el.querySelector('ons-ripple')._onTap({
          gesture: {
            srcEvent: {
              clientX: rect.left + 2/3 * rect.width - 10,
              clientY: rect.top + 2/3 * rect.height - 10
            }
          }
        });
      }
    }
  })();

  var simTappable = function(listItem) {
    listItem.tapped ? listItem._onRelease() : listItem._onTouch();
  };

  var simClick = function(el) {
    var toggle;

    if (el.tagName.match(/BUTTON$/)) {
      toggle = function() {
        el.disabled = !el.disabled;
      };
    } else if (el.tagName.match(/FAB$/)) {
      toggle = simRipple.bind(null, el);
    } else if (el.tagName.match(/(INPUT|DIV)$/)) {
      var listItem = ons._util.findParent(el, 'ons-list-item');
      if (listItem.hasAttribute('tappable')) {
        toggle = function() {
          listItem.tapped ? listItem._onRelease() : listItem._onTouch();
        };
      } else if (listItem.hasAttribute('ripple')) {
        toggle = simRipple.bind(null, listItem);
      } else {
        toggle = function() {};
      }
    }

    var rect = el.getBoundingClientRect();
    pointer.style.left = rect.left + 2/3 * rect.width - 10 + 'px';
    pointer.style.top = rect.top +  2/3 * rect.height - 10 + 'px';
    pointer.style.opacity = '0.5';

    toggle();
    return myApp.delay(250)
    .then(function() {
      toggle();
      pointer.style.opacity = '0';
      return el.onclick ? el.onclick() : el.click();
    });
  };
    
  var toggleMaterialLine = function(el) {
    el._input.classList.toggle('focused');
  };

  var rand = function() {
    return 50 + (Math.random() * 50 - 25);
  };

  var iterate = function () {
    var menu = document.querySelector('ons-splitter-side');

    return simClick(document.querySelector('ons-if:not([style]) [component="button/new-task"'))
      .then(function (page) {
        var inputTitle = document.querySelector('#title-input');
        var inputCategory = document.querySelector('#category-input');

        // input.focus() does not apply material styles properly. Half of these lines are a workaround for that.
        return myApp.delay(600)
          .then(function() {
            return simClick(inputTitle);
          })
          .then(toggleMaterialLine.bind(null, inputTitle))
          .then(myApp.delay.bind(null, 600))
          .then(function() {
            myApp.modifyValue(inputTitle, '🌟 ');
            inputTitle._helper.style.color = '';
          })
          .then(
              myApp.actionBlock.bind(null, [
                myApp.generateStepsFromString(inputTitle, 'our repo!')
              ], 1, rand)
          )
          .then(
              myApp.actionBlock.bind(null, [
                [toggleMaterialLine.bind(null, inputTitle), function() { inputTitle._helper.style.color = 'rgba(0, 0, 0, 0.5)'; }, toggleMaterialLine.bind(null, inputCategory)]
              ], 200, 1)
          )
          .then(function() {
            return simClick(inputCategory);
          })
          .then(
              myApp.actionBlock.bind(null, [
                [myApp.modifyValue.bind(null, inputCategory, 'S'), function() { inputCategory._helper.style.color = ''; }]
              ], 500, 1)
            )
          .then(
            myApp.actionBlock.bind(null, [
              myApp.generateStepsFromString(inputCategory, 'uper important')
            ], 1, rand)
          )
          .then(
              myApp.actionBlock.bind(null, [
                [toggleMaterialLine.bind(null, inputCategory), function() { inputCategory._helper.style.color = 'rgba(0, 0, 0, 0.5)'; }]
              ], 400, 1)
          );
        })
         .then(function() {
          return simClick(document.querySelector('#newTaskPage #inner-urgent-input'));
        })         
        .then(myApp.delay.bind(null, 800))
        .then(function() {
          return simClick(document.querySelector('#newTaskPage ons-if:not([style]) [component="button/save-task"]'));
        })
        .then(myApp.delay.bind(null, 1200))
        .then(function() {
          return simClick(document.querySelector('[component="button/menu"]'));
        })
        .then(myApp.delay.bind(null, 1200))
        .then(function() {
          return simClick(document.querySelector('ons-splitter-side [input-id="radio-super important"]')._input);
        })
        .then(myApp.delay.bind(null, 1000))
        .then(menu.close.bind(menu))
        .then(myApp.delay.bind(null, 1200))
        .then(function() {
          return simClick(document.querySelector('#pending-list #sc-item .center'));
        })
        .then(myApp.delay.bind(null, 1600))
        .then(function() {
          return simClick(document.querySelector('#detailsTaskPage [component="button/save-task"]'));
        })
        .then(myApp.delay.bind(null, 1200))
        .then(function() {
          return simClick(document.querySelector('ons-alert-dialog .alert-dialog-button--primal'));
        })
      ;

  };

  var reset = function() {
    document.querySelector('ons-splitter-side [input-id="r-all"]')._input.click();

    var alertDialog = document.querySelector('ons-alert-dialog'),
      myNavigator = document.querySelector('ons-navigator'),
      menu = document.querySelector('ons-splitter-side');

    var promises = [];
    if (alertDialog) {
      promises.push(alertDialog.hide().then(alertDialog.remove.bind(alertDialog)));
    }

    if (menu.isOpen) {
      promises.push(menu.close());
    }

    if (myNavigator.pages.length > 1) {
      promises.push(myNavigator.popPage());
    }

    return Promise.all(promises).then(function() {
      if (document.getElementById('sc-item')) {
        return simClick(document.querySelector('#sc-item .right'));
      }
    });
  };

  var loop = function() {
    myApp.looping = true;
    return reset()
      .then(myApp.delay.bind(null, 1800))
      .then(iterate)
      .then(myApp.delay.bind(null, 1800))
      .then(loop)
    ;
  };

  return loop().catch(function() {
    myApp.looping = false;
  });
};


////////////////
//  ANIMATION  //
////////////////

(function(){
  var action = function(fn, delay) {
    return myApp.delay(typeof delay === 'function' ? delay() : delay)
      .then(fn);
  };

  myApp.actionBlock = function(actions, initialDelay, actionDelay) {
    if (actions[0] && actions[0].constructor === Array) {
      actions = actions.reduce(function(a, b) {
        return a.concat(b);
      });
    }

    return myApp.delay(initialDelay || 0)
      .then(function() {
        var promisedActions = actions.reduce(function(soFar, fn) {
          return soFar.then(action.bind(null, fn, actionDelay || 2000));
        }, Promise.resolve());
        return promisedActions;
      });
  };

  myApp.modifyValue = function(element, char) {
    element.value = char ? element.value + char : '';
  };

  myApp.generateStepsFromString = function(element, string) {
    var steps = [], index = -1;
    while(++index < string.length) {
      steps.push(myApp.modifyValue.bind(null, element._input, string[index]));
    }

    return steps;
  };


  myApp.delay = function(value) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        if (myApp.userInteraction) {
          reject();
        } else {
          resolve();
        }
      }, value)
    });
  };
})();
