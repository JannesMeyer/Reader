/*
 * GET home page
 */
exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};

/*
 * GET Artikelübersicht
 */
exports.artikel_uebersicht = function(req, res) {
	res.render('artikel_uebersicht', { title: 'Artikelübersicht' });
};