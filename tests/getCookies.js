let unique = 1;

module.exports = function getCookies(request, mail, pwd) {
  let t = (new Date()).getTime();
  if (!mail) mail = (unique * t).toString(36) + '@gmail.com';
  if (!pwd) pwd = (unique++ * t).toString(36);

  let cookies = null;
  return new Promise(async (res, rej) => {
    try {
      await new Promise((reso, reje) => {
        request
          .post('/register')
          .send({ mail: mail, password: pwd })
          .expect(200)
          .end((err) => {
            if (err) reje(err);
            reso();
          });
      });
    } catch (e) {
      return rej(e);
    }
    request
      .post('/login')
      .send({ mail: mail, password: pwd })
      .type('form')
      .expect(200)
      .end((err, result) => {
        if (err) return rej(err);
        cookies = result.header['set-cookie'];
        res(cookies);
      });
  });
};