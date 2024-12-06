(function () {
    "use strict";
  
    let forms = document.querySelectorAll('.php-email-form');
  
    forms.forEach(function(e) {
      e.addEventListener('submit', function(event) {
        event.preventDefault();
  
        let thisForm = this;
  
        let action = thisForm.getAttribute('action');
        let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
        
        if (!action) {
          displayError(thisForm, 'The form action property is not set!');
          return;
        }
        thisForm.querySelector('.loading').classList.add('d-block');
        thisForm.querySelector('.error-message').classList.remove('d-block');
        thisForm.querySelector('.sent-message').classList.remove('d-block');
  
        let formData = new FormData(thisForm);
  
        fetch(action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'text/plain'
          }
        })
        .then(response => {
          thisForm.querySelector('.loading').classList.remove('d-block');
          if (response.ok) {
            return response.text();
          } else {
            return response.text().then(data => {
              throw new Error(data || 'Form submission failed');
            });
          }
        })
        .then(data => {
          thisForm.querySelector('.sent-message').innerHTML = data;
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        })
        .catch(error => {
          displayError(thisForm, error.message);
        });
      });
    });
  
    function displayError(thisForm, error) {
      thisForm.querySelector('.loading').classList.remove('d-block');
      thisForm.querySelector('.error-message').innerHTML = error;
      thisForm.querySelector('.error-message').classList.add('d-block');
    }
  
  })();
  