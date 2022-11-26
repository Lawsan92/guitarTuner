/**
 * @jest-environment jsdom
 */

import React from 'react';
import App from '../components/App.js';
import renderer from 'react-test-renderer';

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

it('renders <App> correctly', () => {
  const tree = renderer
    .create(
      <App/>
     )
    .toJSON();
  expect(tree).toMatchSnapshot();
})