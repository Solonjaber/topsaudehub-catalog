import { Skeleton, Box, Card, CardContent, Grid, Stack } from '@mui/material'

interface LoadingSkeletonProps {
  variant?: 'table' | 'cards' | 'form' | 'stats'
  rows?: number
}

export function LoadingSkeleton({ variant = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (variant === 'stats') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={56} height={56} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (variant === 'cards') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: rows }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (variant === 'form') {
    return (
      <Box>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Box>
        ))}
      </Box>
    )
  }

  // Default: table variant
  return (
    <Box>
      {/* Table header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.100' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" width={`${100 / 5}%`} height={24} />
        ))}
      </Box>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1, p: 2, borderBottom: '1px solid #eee' }}>
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} variant="text" width={`${100 / 5}%`} height={20} />
          ))}
        </Box>
      ))}
    </Box>
  )
}
