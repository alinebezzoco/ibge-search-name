import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function Search() {
  const [query, setQuery] = useState("");
  const [nameInfos, setNameInfos] = useState([]);
  const focusSearch = useRef(null);

  useEffect(() => {
    focusSearch.current.focus();
  }, []);

  const getInfos = async query => {
    const results = await fetch(
      `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${query}`,
      {
        headers: { accept: "application/json" }
      }
    );
    const nameInfosData = await results.json();
    return nameInfosData;
  };

  useEffect(() => {
    let currentQuery = true;
    const controller = new AbortController();

    const loadNameInfos = async () => {
      if (!query) return setNameInfos([]);

      if (currentQuery) {
        const nameInfos = await getInfos(query, controller);
        setNameInfos(nameInfos);
      }
    };
    loadNameInfos();

    return () => {
      currentQuery = false;
      controller.abort();
    };
  }, [query]);

  let nameInfoComponent = nameInfos.map(nameInfo => {
    return nameInfo.res.map((item, i) => {
      const formattedPeriod = item.periodo
        .replace(/[[]/g, "")
        .replace(",", "-");
      const formattedFrequency = `${item.frequencia} ${"nomes registrados"}`;
      return (
        <tr key={i}>
          <td>{formattedPeriod}</td> <td>{formattedFrequency}</td>
        </tr>
      );
    });
  });

  return (
    <>
      <header>
        <h1>Meu nome é popular?</h1>
        <p>
          Saiba se o seu nome já foi ou é popular durante algum período no
          Brasil de acordo com os dados extraídos do IBGE
        </p>
      </header>
      <form>
        <input
          placeholder="Digite o seu nome ou qualquer outro que queira pesquisar"
          ref={focusSearch}
          onChange={e => setQuery(e.target.value)}
          value={query}
        />
      </form>

      <table>
        {query.length > 0 && (
          <>
            <thead>
              <tr>
                <th>Período</th>
                <th>Frequência</th>
              </tr>
            </thead>
            <tbody>
              {nameInfoComponent.length > 0 ? (
                nameInfoComponent
              ) : (
                <tr className="not-found">
                  Nenhuma informação encontrada
                </tr>
              )}
            </tbody>
          </>
        )}
      </table>
    </>
  );
}
