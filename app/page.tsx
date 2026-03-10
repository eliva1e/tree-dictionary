"use client";

import { useState, useEffect } from "react";
import { Container, Typography, Paper, Box, TextField, Button, Autocomplete, CircularProgress } from "@mui/material";
import { TreeVisualization } from "@/components/TreeVisualization";

export interface VizNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  isHighlighted: boolean;
  children: VizNode[];
}

export default function Home() {
  const [prefix, setPrefix] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  const [trieData, setTrieData] = useState<VizNode | null>(null);
  const [loadingTrie, setLoadingTrie] = useState(true);

  const [newWord, setNewWord] = useState("");
  const [addingWord, setAddingWord] = useState(false);

  useEffect(() => {
    fetchTrie(prefix);
  }, [prefix]);

  useEffect(() => {
    if (prefix) {
      const fetchAutocomplete = async () => {
        setLoadingAutocomplete(true);
        try {
          const res = await fetch(`/api/autocomplete?prefix=${encodeURIComponent(prefix)}`);
          const data = await res.json();
          setOptions(data);
        } catch (error) {
          console.error("Failed to fetch autocomplete", error);
        } finally {
          setLoadingAutocomplete(false);
        }
      };
      // Debounce slightly in a real app, but ok here
      const timeoutId = setTimeout(fetchAutocomplete, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setOptions([]);
    }
  }, [prefix]);

  const fetchTrie = async (currentPrefix: string) => {
    setLoadingTrie(true);
    try {
      const res = await fetch(`/api/trie?prefix=${encodeURIComponent(currentPrefix)}`);
      const data = await res.json();
      setTrieData(data);
    } catch (error) {
      console.error("Failed to fetch trie", error);
    } finally {
      setLoadingTrie(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setAddingWord(true);
    try {
      await fetch("/api/trie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: newWord }),
      });
      setNewWord("");
      fetchTrie(prefix); // Refresh trie after adding
    } catch (error) {
      console.error("Failed to add word", error);
    } finally {
      setAddingWord(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Строковый словарь (Префиксное дерево)
      </Typography>
      
      <Box display="flex" gap={2} my={4}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Автодополнение по префиксу
          </Typography>
          <Autocomplete
            freeSolo
            options={options}
            loading={loadingAutocomplete}
            onInputChange={(event, newInputValue) => {
              setPrefix(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Введите префикс"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAutocomplete ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Paper>

        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Добавить слово
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              label="Новое слово"
              variant="outlined"
              size="small"
              fullWidth
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddWord();
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddWord}
              disabled={!newWord.trim() || addingWord}
            >
              Добавить
            </Button>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, minHeight: 400, overflowX: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Визуализация дерева
        </Typography>
        {loadingTrie && !trieData ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            {trieData ? <TreeVisualization data={trieData} /> : <Typography>Пусто</Typography>}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
