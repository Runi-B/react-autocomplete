'use strict';

var React        = require('react');
var ReactDOM     = require('react-dom');
var assert       = require('assert');
var sinon        = require('sinon');
var TestUtils    = require('react-addons-test-utils');
var Autocomplete = require('../');

var options      = require('./fixture.json');

describe('Autocomplete', function() {

  function createAndMount(props) {
    var component = React.createElement(Autocomplete, props);
    return TestUtils.renderIntoDocument(component);
  }

  function getDOMAnyInputComponent(parent) {
    try {
        return TestUtils.findRenderedDOMComponentWithTag(parent, 'input');
    } catch(err) {
        return TestUtils.findRenderedDOMComponentWithTag(parent, 'select');
    }
  }

  function getValueDOM(parent) {
    var input = getDOMAnyInputComponent(parent);
    return ReactDOM.findDOMNode(input).value;
  }

  function setValueDOM(parent, text) {
      var input = getDOMAnyInputComponent(parent);
      ReactDOM.findDOMNode(input).value = text;
      TestUtils.Simulate.change(input);
  }

  function getResultsContainerDOM(component) {
    var results = TestUtils.findRenderedDOMComponentWithClass(
      component,
      'react-autocomplete-Results');
      
    return ReactDOM.findDOMNode(results);
  }

  function getResultsDOM(component) {
    return TestUtils.scryRenderedDOMComponentsWithClass(
      component,
      'react-autocomplete-Result').map((c) => ReactDOM.findDOMNode(c));
  }

  function assertResultsShown(component, shown) {
    var resultContainerDOM = getResultsContainerDOM(component);
    assert.equal(
      resultContainerDOM.style.display,
      shown ? 'block' : 'none');
  }

  function assertResultsCount(component, count) {
    var resultsDOM = getResultsDOM(component);
    assert.equal(resultsDOM.length, count);
  }

  it('should have "react-autocomplete" class', function() {
    var component = createAndMount({options: options});
    var classes = ReactDOM.findDOMNode(component).classList;
    assert.equal(classes.contains('react-autocomplete-Autocomplete'), true);
  });

  it('should allow setting initial value via "value" prop', function() {
    var component = createAndMount({
        options: options,
        value: options[0]
    });
    var searchTermDOM = getValueDOM(component);
    assert.equal(searchTermDOM, 'Erickson Snyder');
  });

  it('should allow setting initial search term via prop', function() {
    var component = createAndMount({
        options: options,
        searchTerm: 's'
    });
    var searchTermDOM = getValueDOM(component);
    assert.equal(searchTermDOM, 's');
  });

  it('shows a list of all options on focus', function() {
    var component = createAndMount({options: options});

    assertResultsShown(component, false);
    assertResultsCount(component, 0);

    var searchDOM = getDOMAnyInputComponent(component);
    TestUtils.Simulate.focus(searchDOM);

    assertResultsShown(component, true);
    assertResultsCount(component, 1000);
  });

  it('shows a list of options when user starts typing', function() {
    var results;
    var component = createAndMount({options: options});

    assertResultsShown(component, false);
    assertResultsCount(component, 0);

    setValueDOM(component, 'Erickson');
    assert.equal(getValueDOM(component), 'Erickson');

    assertResultsShown(component, true);

    results = getResultsDOM(component);
    assert.equal(results.length, 2);
    assert.equal(results[0].innerText, 'Erickson Snyder');
    assert.equal(results[1].innerText, 'Tabitha Erickson');

    setValueDOM(component, 'Erickson Snyder');
    assert.equal(getValueDOM(component), 'Erickson Snyder');

    assertResultsShown(component, true);

    results = getResultsDOM(component);
    assert.equal(results.length, 1);
    assert.equal(results[0].innerText, 'Erickson Snyder');
  });

  it('triggers onChange when values changes (via click)', function() {
    var onChange = sinon.spy();
    var component = createAndMount({options: options, onChange: onChange});

    setValueDOM(component, 'Erickson');
    assert.equal(getValueDOM(component), 'Erickson');

    var results = getResultsDOM(component);

    assert.equal(results.length, 2);
    assert.equal(results[0].innerText, 'Erickson Snyder');

    TestUtils.Simulate.click(results[0]);

    sinon.assert.calledOnce(onChange);
    sinon.assert.calledWith(onChange, options[0]);
  });

  it('triggers onChange when values changes (via enter key)', function() {
    var onChange = sinon.spy();
    var component = createAndMount({options: options, onChange: onChange});

    setValueDOM(component, 'Erickson');
    assert.equal(getValueDOM(component), 'Erickson');

    var results = getResultsDOM(component);

    assert.equal(results.length, 2);
    assert.equal(results[0].innerText, 'Erickson Snyder');

    var searchDOM = getDOMAnyInputComponent(component);
    TestUtils.Simulate.keyDown(searchDOM, {key: 'ArrowDown'});
    TestUtils.Simulate.keyDown(searchDOM, {key: 'Enter'});

    sinon.assert.calledOnce(onChange);
    sinon.assert.calledWith(onChange, options[0]);
  });
});
