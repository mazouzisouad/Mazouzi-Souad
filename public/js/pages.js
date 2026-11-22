// Petits utilitaires communs aux pages du site (connexion, compte, merci…).
window.Pages = {
  message: function (id, texte, type) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = texte || '';
    el.className = 'message ' + (type || 'ok') + (texte ? ' visible' : '');
  },
  dateFr: function (d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  },
  api: function (chemin, corps) {
    return CodeAcces.jeton().then(function (jeton) {
      return fetch(chemin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (jeton || '') },
        body: JSON.stringify(corps || {}),
      });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { d._statut = r.status; return d; });
    });
  },
  // Message d'erreur Supabase en français
  traduire: function (e) {
    var m = (e && (e.message || e.error_description)) || String(e);
    var t = {
      'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
      'Email not confirmed': 'Confirmez d’abord votre adresse e-mail (lien reçu par e-mail).',
      'User already registered': 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 8 caractères.',
    };
    for (var k in t) if (m.indexOf(k) !== -1) return t[k];
    if (/rate limit/i.test(m)) return 'Trop de tentatives. Réessayez dans quelques minutes.';
    if (/weak|pwned/i.test(m)) return 'Mot de passe trop faible ou trop connu. Choisissez-en un autre.';
    return m;
  },
};
