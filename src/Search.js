import React, { useState, useEffect } from "react";
import axios from 'axios';
import { get } from 'lodash'

const SearchSearch = () => {
  const [data, setData] = useState();
  const [query, setQuery] = useState();

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      const response = await axios.get('https://registry.npmjs.cf/' + query).then((response) => response.data);
      if (!ignore) {
          const latestVersionNumber = Object.keys(response.versions).length-1
          const latestVersion =  Object.keys(response.versions)[latestVersionNumber]
          setData(JSON.stringify(response.versions[latestVersion].dependencies))
      }
    }

    query && fetchData();
    return () => { ignore = true; }
  }, [query]);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {data}
    </>
  );
}

export default SearchSearch