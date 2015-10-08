import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './containers/App'

const store = createStore(rootReducer, {
  tracks: [
    {
      name: "Test Track",
      distance: 12094
    }
  ]
})

React.render(
  <Provider store={store}>
    { () => <App /> }
  </Provider>,
  document.getElementById('root')
)
