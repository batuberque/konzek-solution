import { useReducer, useEffect, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";

const LIST_COUNTRIES = gql`
  {
    countries {
      code
      name
      emoji
      continent {
        code
        name
      }
    }
  }
`;

interface Country {
  code: string;
  name: string;
  emoji: string;
  continent: {
    code: string;
    name: string;
  };
}

interface AppState {
  countries: Country[];
  filteredCountries: Country[];
  selectedCountryCode: string | null;
  filterText: string;
}

type Action =
  | { type: "setCountries"; payload: Country[] }
  | { type: "setFilteredCountries"; payload: Country[] }
  | { type: "selectCountry"; payload: string | null }
  | { type: "setFilterText"; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "setCountries":
      return {
        ...state,
        countries: action.payload,
        filteredCountries: action.payload,
      };
    case "setFilteredCountries":
      return { ...state, filteredCountries: action.payload };
    case "selectCountry":
      return {
        ...state,
        selectedCountryCode: action.payload,
      };
    case "setFilterText":
      return { ...state, filterText: action.payload };
    default:
      return state;
  }
}

function App() {
  const { data, loading, error } = useQuery<{ countries: Country[] }>(
    LIST_COUNTRIES
  );
  const [state, dispatch] = useReducer(reducer, {
    countries: [],
    filteredCountries: [],
    selectedCountryCode: null,
    filterText: "",
  });

  useEffect(() => {
    if (data?.countries) {
      dispatch({ type: "setCountries", payload: data.countries });
    }
    return () => {};
  }, [data]);

  const filteredCountries = useMemo(() => {
    return state.countries.filter(
      (country) =>
        country.name.toLowerCase().includes(state.filterText.toLowerCase()) ||
        country.emoji.includes(state.filterText)
    );
  }, [state.filterText, state.countries]);

  useEffect(() => {
    dispatch({ type: "setFilteredCountries", payload: filteredCountries });

    if (filteredCountries.length > 0) {
      const indexToSelect = Math.min(9, filteredCountries.length - 1);
      dispatch({
        type: "selectCountry",
        payload: filteredCountries[indexToSelect].code,
      });
    } else {
      dispatch({ type: "selectCountry", payload: null });
    }

    return () => {};
  }, [filteredCountries]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search (e.g., 'France')"
        value={state.filterText}
        onChange={(e) =>
          dispatch({ type: "setFilterText", payload: e.target.value })
        }
      />
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {state.filteredCountries.map((country) => (
          <li
            key={country.code}
            style={{
              backgroundColor:
                state.selectedCountryCode === country.code
                  ? "#7fffd4"
                  : "transparent",
              cursor: "pointer",
              padding: "5px",
              margin: "1px",
            }}
            onClick={() =>
              dispatch({ type: "selectCountry", payload: country.code })
            }
          >
            {country.name} {country.emoji}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
