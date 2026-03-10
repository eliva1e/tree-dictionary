'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export interface VizNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  isHighlighted: boolean;
  children: VizNode[];
}

interface TreeProps {
  data: VizNode;
}

const TreeNode: React.FC<{ node: VizNode }> = ({ node }) => {
  const isRoot = node.id === 'root';

  return (
    <Box display="flex" flexDirection="column" alignItems="center" m={{ xs: 0.5, sm: 1 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Box
          sx={{
            // Уменьшаем размер узла на мобильных
            width: { xs: 30, sm: 40 },
            height: { xs: 30, sm: 40 },
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: node.isHighlighted ? 'primary.main' : 'grey.300',
            color: node.isHighlighted ? 'white' : 'text.primary',
            border: node.isEndOfWord ? '3px solid #ff9800' : '2px solid transparent',
            boxShadow: 2,
            zIndex: 2,
            position: 'relative',
            fontWeight: 'bold',
          }}
          title={node.isEndOfWord ? 'End of word' : ''}
        >
          <Typography
            variant="body1"
            component="span"
            sx={{
              textTransform: 'uppercase',
              fontSize: { xs: '0.8rem', sm: '1rem' },
            }}
          >
            {isRoot ? '*' : node.char}
          </Typography>
        </Box>
      </motion.div>

      {node.children.length > 0 && (
        <Box
          display="flex"
          justifyContent="center"
          sx={{
            position: 'relative',
            mt: { xs: 1.5, sm: 2 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: { xs: -12, sm: -16 },
              left: '50%',
              width: '2px',
              height: { xs: '12px', sm: '16px' },
              backgroundColor: node.children.some((c) => c.isHighlighted)
                ? 'primary.main'
                : 'grey.400',
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              // Уменьшаем зазор между дочерними элементами на мобильных
              gap: { xs: 1, sm: 2 },
              position: 'relative',
            }}
          >
            {node.children.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: -12, sm: -16 },
                  left: 'calc(50% / ' + node.children.length + ')',
                  right: 'calc(50% / ' + node.children.length + ')',
                  height: '2px',
                  backgroundColor: 'grey.400',
                  zIndex: 0,
                  display: 'none',
                }}
              />
            )}

            {node.children.map((child, index) => (
              <Box
                key={child.id}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: { xs: -12, sm: -16 },
                    left: '50%',
                    width: '2px',
                    height: { xs: '12px', sm: '16px' },
                    backgroundColor: child.isHighlighted ? '#1976d2' : '#bdbdbd',
                    zIndex: 1,
                  },
                  ...(node.children.length > 1 && {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: { xs: -12, sm: -16 },
                      left: index === 0 ? '50%' : 0,
                      right: index === node.children.length - 1 ? '50%' : 0,
                      width: index === 0 || index === node.children.length - 1 ? '50%' : '100%',
                      height: '2px',
                      backgroundColor: '#bdbdbd',
                      zIndex: 1,
                    },
                  }),
                }}
              >
                <TreeNode node={child} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const TreeVisualization: React.FC<TreeProps> = ({ data }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <TreeNode node={data} />
    </Box>
  );
};
