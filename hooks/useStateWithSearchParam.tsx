import { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * useStateWithSearchParam hook
 *
 * This hook manages a state value and synchronizes it with a URL search parameter.
 * It behaves similarly to the useState hook but updates the URL whenever the state changes.
 *
 * @param {object} args - An object containing the parameters:
 * @param {string} args.searchParamName - The name of the search parameter in the URL.
 * @param {function} args.fromParam - A function that converts the search parameter value to the desired state type.
 * @param {function} args.toParam - A function that converts the state value to a string to be used in the URL.
 *
 * @returns {[T, Dispatch<SetStateAction<T>>]} - A tuple with the current state and a function to update the state.
 */
export const useStateWithSearchParam = <T,>(args: {
  searchParamName: string;
  fromParam: (value: string | null) => T;
  toParam: (value: T) => string | undefined;
}): [T, Dispatch<SetStateAction<T>>] => {
  let [searchParams, setSearchParams] = useSearchParams();

  // Initialize state with the value from the URL search parameter
  const [_state, _setState] = useState<T>(() => args.fromParam(searchParams.get(args.searchParamName)));

  // Update state and URL search parameter
  const setState = useCallback(
    (value: ((v: T) => T) | T) => {
      _setState((prevState) => {
        const newValue = typeof value === "function" ? (value as (v: T) => T)(prevState) : value;
        const newParamValue = args.toParam(newValue);

        if (newParamValue) {
          searchParams.set(args.searchParamName, newParamValue);
        } else {
          searchParams.delete(args.searchParamName);
        }
        setSearchParams(searchParams);

        return newValue;
      });
    },
    [args, searchParams, setSearchParams]
  );

  // Sync state with URL parameter when it changes
  useEffect(() => {
    const paramValue = searchParams.get(args.searchParamName);
    const newValue = args.fromParam(paramValue);
    if (_state !== newValue) {
      _setState(newValue);
    }
  }, [args, searchParams, _state]);

  return [_state, setState];
};
