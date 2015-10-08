import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './containers/App'

const store = createStore(rootReducer)

React.render(
  <Provider store={store}>
    { () => <App /> }
  </Provider>,
  document.getElementById('root')
)
