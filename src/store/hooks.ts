// Copyright © 2026 JalapenoLabs

import type { AppDispatch, RootState } from './store'

// Core
import { useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
