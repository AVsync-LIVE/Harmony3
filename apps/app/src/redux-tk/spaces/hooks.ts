import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { spacesActions } from './slice'
import * as selectors from './selectors'
import { CollectionResponses, MessagesResponse, UsersResponse } from 'redux-tk/pocketbase-types'
import { isEqual } from 'lodash'

export const useSpaces_activeSpaceId = (): string | null => 
  useSelector(selectors.selectActiveSpaceId, isEqual)

export const useSpaces_activeGroupId = (): string | null => 
  useSelector(selectors.selectActiveGroupId, isEqual)

export const useSpaces_activeChannelId = (): string | null => 
  useSelector(selectors.selectActiveChannelId, isEqual)

export const useSpaces_activeThreadId = (): string | null => 
  useSelector(selectors.selectActiveThreadId, isEqual)

export const useSpaces_activeMessageId = (): string | null => 
  useSelector(selectors.selectActiveMessageId, isEqual)

export const useSpaces_spaces = (): CollectionResponses['spaces'][] => 
  useSelector(selectors.selectSpaces, isEqual)

export const useSpaces_activeSpace = (): CollectionResponses['spaces'] | undefined => 
  useSelector(selectors.selectActiveSpace, isEqual)

export const useSpaces_activeGroup = (): CollectionResponses['groups'] | undefined => 
  useSelector(selectors.selectActiveGroup, isEqual)

export const useSpaces_activeChannel = (): CollectionResponses['channels'] | undefined => 
  useSelector(selectors.selectActiveChannel, isEqual)

export const useSpaces_activeThread = (): CollectionResponses['threads'] | undefined => 
  useSelector(selectors.selectActiveThread, isEqual)

export const useSpaces_activeMessage = (): CollectionResponses['messages'] | undefined => 
  useSelector(selectors.selectActiveMessage, isEqual)

export const useSpaces_activeSpaceIndex = (): number | null => 
  useSelector(selectors.selectActiveSpaceIndex, isEqual)

export const useSpaces_activeChannelInfo = (): { name: string; description: string; id: string } | null => 
  useSelector(selectors.selectActiveChannelInfo, isEqual)

export const useSpaces_currentUser = (): UsersResponse | null => 
  useSelector(selectors.selectCurrentUser, isEqual)

export const useSpaces_activeSpaceGroups = (): (CollectionResponses['groups'] & { channels: (CollectionResponses['channels'] & { threadsCount: number })[] })[] => 
  useSelector(selectors.selectActiveSpaceGroups, isEqual)

export const useSpaces_activeChannelThreadNamesAndDescriptions = (): { name: string, description: string }[] => 
  useSelector(selectors.selectActiveChannelThreadNamesAndDescriptions, isEqual)

export const useSpaces_activeGroupChannelNamesAndDescriptions = (): { name: string, description: string }[] => 
  useSelector(selectors.selectActiveGroupChannelNamesAndDescriptions, isEqual)

export const useSpaces_activeSpaceGroupsInfo = (): { name: string, description: string, id: string }[] => 
  useSelector(selectors.selectActiveSpaceGroupsInfo, isEqual)

  export const useSpaces_activeGroupChannelsInfo = (): { name: string, description: string, id: string }[] => 
  useSelector(selectors.selectActiveGroupChannelsInfo, isEqual)

export const useSpaces_activeChannelThreadsInfo = (): { name: string, description: string, id: string }[] => 
  useSelector(selectors.selectActiveChannelThreadsInfo, isEqual)

export const useSpaces_activeChannelThreads = (): (CollectionResponses['threads'] & { messageIds: string[] })[] => 
  useSelector(selectors.selectActiveChannelThreads, isEqual)

export const useSpaces_currentUserId = (): string | null => 
  useSelector(selectors.selectCurrentUserId, isEqual)

export const useSpaces_messageById = (id: string): MessagesResponse => {
  const memoizedSelector = useMemo(() => selectors.selectMessageById(id), [id])
  return useSelector(memoizedSelector, isEqual)
}

export const useSpaces_countById = (id: string): { groups: number; channels: number; threads: number; messages: number } => {
  const memoizedSelector = useMemo(() => {
    return state => {
      const counts = selectors.selectCountBySpaceId(state)
      return counts[id] || { groups: 0, channels: 0, threads: 0, messages: 0 }
    }
  }, [id])

  return useSelector(memoizedSelector, isEqual)
}

export const useSpaces_countByGroupId = (id: string): { channels: number; threads: number; messages: number } => {
  const memoizedSelector = useMemo(() => {
    return state => {
      const counts = selectors.selectCountsByGroupId(state)
      return counts[id] || { channels: 0, threads: 0, messages: 0 }
    }
  }, [id])

  return useSelector(memoizedSelector, isEqual)
}

export const useSpaces_countByChannelId = (id: string): { threads: number; messages: number } => {
  const memoizedSelector = useMemo(() => {
    return state => {
      const counts = selectors.selectCountByChannelId(state)
      return counts[id] || { threads: 0, messages: 0 }
    }
  }, [id])

  return useSelector(memoizedSelector, isEqual)
}

export const useSpaces_usersById = (): Record<string, UsersResponse> => 
  useSelector(selectors.selectUsersById, isEqual)

export const useSpaces_setActiveSpaceIndex = () => {
  const dispatch = useDispatch()
  return useCallback((index: number | null) => dispatch(spacesActions.setActiveSpaceIndex(index)), [dispatch])
}
export const useSpaces_setActiveSpaceId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(spacesActions.setActiveSpaceId(payload)), [dispatch])
}
export const useSpaces_setActiveGroupId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(spacesActions.setActiveGroupId(payload)), [dispatch])
}
export const useSpaces_setActiveChannelId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(spacesActions.setActiveChannelId(payload)), [dispatch])
}
export const useSpaces_setActiveThreadId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(spacesActions.setActiveThreadId(payload)), [dispatch])
}
export const useSpaces_setActiveMessageId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(spacesActions.setActiveMessageId(payload)), [dispatch])
}
export const useSpaces_setCurrentUser = () => {
  const dispatch = useDispatch()
  return useCallback((payload: UsersResponse | null) => dispatch(spacesActions.setCurrentUser(payload)), [dispatch])
}
