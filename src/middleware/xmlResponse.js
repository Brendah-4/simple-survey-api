const { create } = require('xmlbuilder2');

module.exports = function xmlResponse(req, res, next) {
  res.xmlSuccess = function (data, statusCode = 200) {
<<<<<<< HEAD
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('response')
        .ele('status').txt('success').up()
        .ele('data').import(toXmlNode(data)).up()
      .end({ prettyPrint: true });

    res.status(statusCode).set('Content-Type', 'application/xml').send(doc);
  };

=======
    const dataEle = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('response')
        .ele('status').txt('success').up()
        .ele('data');
    buildXml(dataEle, data);
    const doc = dataEle.up().end({ prettyPrint: true });
    res.status(statusCode).set('Content-Type', 'application/xml').send(doc);
  };
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
  res.xmlError = function (message, statusCode = 400) {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('response')
        .ele('status').txt('error').up()
        .ele('message').txt(String(message)).up()
      .end({ prettyPrint: true });
<<<<<<< HEAD

    res.status(statusCode).set('Content-Type', 'application/xml').send(doc);
  };

  next();
};

function toXmlNode(data) {
  const root = create().ele('root');
  buildXml(root, data);
  return root.first();
}

=======
    res.status(statusCode).set('Content-Type', 'application/xml').send(doc);
  };
  next();
};

>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
function buildXml(node, data) {
  if (Array.isArray(data)) {
    data.forEach((item) => {
      const child = node.ele('item');
      buildXml(child, item);
    });
  } else if (data !== null && typeof data === 'object') {
    Object.entries(data).forEach(([key, val]) => {
      const safeKey = isValidXmlName(key) ? key : `_${key}`;
      const child = node.ele(safeKey);
      buildXml(child, val);
    });
  } else {
    node.txt(data == null ? '' : String(data));
  }
}
<<<<<<< HEAD

=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
function isValidXmlName(name) {
  return /^[a-zA-Z_][\w.-]*$/.test(name);
}
