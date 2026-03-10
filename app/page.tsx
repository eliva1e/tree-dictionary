'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { TreeVisualization } from '@/components/TreeVisualization';

export interface VizNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  isHighlighted: boolean;
  children: VizNode[];
}

export default function Home() {
  const [prefix, setPrefix] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  const [trieData, setTrieData] = useState<VizNode | null>(null);
  const [loadingTrie, setLoadingTrie] = useState(true);

  const [newWord, setNewWord] = useState('');
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
          console.error('Failed to fetch autocomplete', error);
        } finally {
          setLoadingAutocomplete(false);
        }
      };
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
      console.error('Failed to fetch trie', error);
    } finally {
      setLoadingTrie(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setAddingWord(true);
    try {
      await fetch('/api/trie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: newWord }),
      });
      setNewWord('');
      fetchTrie(prefix);
    } catch (error) {
      console.error('Failed to add word', error);
    } finally {
      setAddingWord(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography
        variant="h4"
        sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        gutterBottom
        align="center"
      >
        Строковый словарь
      </Typography>

      {/* Делаем flex-контейнер вертикальным на мобильных (xs) и горизонтальным на планшетах (md) */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} my={{ xs: 2, sm: 4 }}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Добавить слово
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
            <TextField
              label="Новое слово"
              variant="outlined"
              size="small"
              fullWidth
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWord();
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddWord}
              disabled={!newWord.trim() || addingWord}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Добавить
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Обертка для корректного горизонтального скролла без обрезки */}
      <Paper sx={{ p: { xs: 1, sm: 3 }, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ pl: 1 }}>
          Визуализация дерева
        </Typography>

        {loadingTrie && !trieData ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              overflowX: 'auto',
              overflowY: 'hidden',
              width: '100%',
              py: 2,
            }}
          >
            {/* max-content позволяет внутреннему контейнеру растягиваться в ширину, margin: 0 auto центрирует его, если он меньше родителя */}
            <Box sx={{ minWidth: '100%', width: 'max-content', margin: '0 auto' }}>
              {trieData ? <TreeVisualization data={trieData} /> : <Typography>Пусто</Typography>}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
