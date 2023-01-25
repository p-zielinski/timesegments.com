import { createStore, applyMiddleware, AnyAction } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import rootReducer from './reducers';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// middleware
const middleware = [thunk];

// creating store
export const store = createStore(
  rootReducer,
  {},
  composeWithDevTools(applyMiddleware(...middleware))
);

// assigning store to next wrapper
const makeStore = () => store;

export const wrapper = createWrapper(makeStore);

/* Types */
export type AppDispatch = typeof store.dispatch;
export type ReduxState = ReturnType<typeof rootReducer>;
export type TypedDispatch = ThunkDispatch<ReduxState, any, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  ReduxState,
  unknown,
  AnyAction
>;
export const useTypedDispatch = () => useDispatch<TypedDispatch>();
export const useTypedSelector: TypedUseSelectorHook<ReduxState> = useSelector;
