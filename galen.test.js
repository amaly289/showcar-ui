var sauceEnabled = System.getProperty('sauce.enabled');
var sauceUsername = System.getProperty('sauce.username');
var sauceAccessKey = System.getProperty('sauce.accessKey');
var tunnelIdentifier = System.getProperty('sauce.tunnelIdentifier');
var gridUrl = 'http://'+ sauceUsername + ':' + sauceAccessKey + '@ondemand.saucelabs.com:80/wd/hub';
var buildId = System.getProperty('test.buildId');
var testUrl = System.getProperty('test.url');
var specFilter = System.getProperty('test.filter') || '';

var sauceBrowsers = {
    chrome_latest: {
        name: 'chrome',
        desiredCapabilities: {
            browserName: 'chrome',
            version: 'latest',
        }
    },
    firefox_latest: {
        name: 'firefox',
        desiredCapabilities: {
            browserName: 'firefox',
            version: 'latest'
        }
    },
    ie_11: {
        name: 'ie',
        desiredCapabilities: {
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '11'
        }
    },
    safari: {
        name: 'safari',
        desiredCapabilities: {
            browserName: 'safari',
            platform: 'OS X 10.12',
            version: 'latest'
        }
    },
    edge: {
        name: 'edge',
        desiredCapabilities: {
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10',
            version: 'latest'
        }
    }
};

var localBrowsers = {
    chrome: {
        name: 'chrome'
    }
};

var browsers = sauceEnabled ? sauceBrowsers : localBrowsers;

var viewports = {
    desktop: {
        name: 'DESKTOP',
        tags: 'desktop',
        size: '1024x768'
    },
    tablet: {
        name: 'TABLET',
        tags: 'tablet',
        size: '768x1024'
    },
    mobile: {
        name: 'MOBILE',
        tags: 'mobile',
        size: '320x568'
    }
};

var getSpecs = function() {
  var resourceURL = new java.net.URL(testUrl + '?gspec=true');
  var urlConnection = resourceURL.openConnection();
  var inputStream = new java.io.InputStreamReader(urlConnection
          .getInputStream());
  var bufferedReader = new java.io.BufferedReader(inputStream);
  var inputLine = bufferedReader.readLine();
  bufferedReader.close();
  var specs = String(inputLine);
  return JSON.parse(specs);
}

var specs = getSpecs().filter(function(value) {
    return value.indexOf(specFilter) >= 0;
}).map(function(s) {
    return [s];
});

var drivers = {};

afterTestSuite(function () {
  for(browser in browsers) {
    drivers[browser].quit();
  }
});

testRetry(function (test, retryCount) {
    if (retryCount < 2) {
        return true;
    }
    else {
        return false;
    }
});

function getDriver(browser) {
  if (drivers[browser.name] === undefined) {
    drivers[browser.name] = createNewDriver(browser);
  }
  return drivers[browser.name];
}

function createNewDriver(browser) {
  if(sauceEnabled) {
      browser.desiredCapabilities['tunnel-identifier'] = tunnelIdentifier;
      browser.desiredCapabilities['build'] = buildId;
      browser.desiredCapabilities['public'] = 'public';
      return createGridDriver(gridUrl, { desiredCapabilities: browser.desiredCapabilities });
  } else {
      return createDriver();
  }
}

forAll(browsers, function (browser) {
    forAll(viewports, function (viewport) {
        forAll(specs, function (spec_path) {
            test('Test ' + spec_path.split('/').slice(-1)[0] + ' on ' + browser.name + ' ' + viewport.name, function (browser, viewport, spec_path) {
              var testDocUrl = testUrl + '/docs/' + spec_path.split('/').slice(-4,-2).join('/');
              var driver = getDriver(browser);
              driver.get(testDocUrl);
              resize(driver, viewport.size)
              checkLayout(getDriver(browser), spec_path, [viewport.tags, browser.name]);
            });
        });
    });
});
