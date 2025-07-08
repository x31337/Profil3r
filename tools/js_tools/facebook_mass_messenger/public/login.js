'use strict';

$(function () {
  $('#form').on('submit', function (event) {
    event.preventDefault();

    $('#login').prop('disabled', true);

    const code = $('#code');
    $.post(
      '/login',
      {
        email: $('#email').val(),
        password: $('#password').val(),
        code: code.val()
      },
      function (result) {
        if (result.error) {
          $('#login').prop('disabled', false);

          let error = result.error;
          if (error === 'login-approval') {
            $('#code-group').show();
            code.prop('required', true);

            error = 'Please enter your 2-Factor Auth code.';
          }

          const modal = $('#error');
          modal.find('.modal-body').text(error);
          modal.modal();
        } else location.href = '/';
      }
    );
  });
});
