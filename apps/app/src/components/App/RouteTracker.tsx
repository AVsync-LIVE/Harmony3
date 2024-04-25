import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { 
  useHarmony_setActiveSpaceId,
  useHarmony_setActiveGroupId,
  useHarmony_setActiveChannelId,
  useHarmony_setActiveThreadId,
  useHarmony_setActiveMessageId
} from 'redux-tk/harmony/hooks'

export const RouteTracker = () => {
  const params = useParams()
  const location = useLocation()
  const setActiveSpaceId = useHarmony_setActiveSpaceId()
  const setActiveGroupId = useHarmony_setActiveGroupId()
  const setActiveChannelId = useHarmony_setActiveChannelId()
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const setActiveMessageId = useHarmony_setActiveMessageId()

  useEffect(() => {
    const { spaceid, groupid, channelid, threadid, messageid } = params
    if (spaceid) setActiveSpaceId(spaceid)
    if (groupid) setActiveGroupId(groupid)
    if (channelid) setActiveChannelId(channelid)
    if (threadid) setActiveThreadId(threadid)
    if (messageid) setActiveMessageId(messageid)
  }, [params, location])

  return <></>
}