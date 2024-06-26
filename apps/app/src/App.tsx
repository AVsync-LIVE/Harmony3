import { NavSpaces } from '@avsync.live/formation'
import { SpaceSidebar } from './components/App/SpaceSidebar'
import { Channel } from 'components/App/Channel'
import { useSpaces_setCurrentUser } from 'redux-tk/spaces/hooks'
import { useEffect } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { UsersResponse } from 'redux-tk/pocketbase-types'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import SpacesDashboard from 'components/App/SpacesDashboard'
import { Space } from 'components/App/Space'
import { Group } from 'components/App/Group'
import { Profile } from 'components/App/Profile/Profile'
import { Personas } from 'components/App/Personas/Personas'
import { Persona } from 'components/App/Personas/Persona'
import { Tools } from 'components/App/Tools/Tools'
import { ProfileSidebar } from 'components/App/Profile/ProfileSidebar'

interface Props {
  children: React.ReactNode
}

export const App = ({ children }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const setCurrentUser = useSpaces_setCurrentUser()

  useEffect(() => {
    const currentUser = pb.authStore.model as UsersResponse | null
    if (!currentUser) {
      navigate('/sign-in')
    }
    else {
      setCurrentUser(currentUser)
    }
  }, [])

  const FirstPage = () => {
    if (location.pathname.startsWith('/personas')) {
      return <Personas />
    }
    if (location.pathname.startsWith('/profile')) {
      return <ProfileSidebar />
    }
    return <SpaceSidebar />
  }

  const SecondPage = () => {
    const location = useLocation()
  
    if (location.pathname === '/profile') {
      return <Profile />
    }

    if (location.pathname === '/spaces/create') {
      return <Space create />
    }

    if (location.pathname.startsWith('/personas')) {
      if (location.pathname === '/personas') {
        return <></>
      }
      return <Persona />
    }

    // Match for the specific space ID
    const matchSpace = matchPath({ path: "/spaces/:spaceid", end: true }, location.pathname)
    if (matchSpace) {
      return <Space />
    }
  
    // Match for the specific group within a space
    const matchGroup = matchPath({ path: "/spaces/:spaceid/groups/:groupid", end: true }, location.pathname)
    if (matchGroup) {
      return <Group />
    }
  
    switch (location.pathname) {
      default:
        return <Channel />
    }
  }

  const ThirdPage = () => {
    switch(location.pathname) {
      default:
        return <Tools />
    }
  }

  return (
    <>
      {
        location.pathname === '/'
          ? <SpacesDashboard />
          : <NavSpaces
              activeSwipeIndex={0}
              onSwipe={index => console.log(index)}
              sidebarWidth='380px'
              firstPage={<FirstPage />}
              secondPage={<SecondPage />}
              thirdPage={<>
                {children}
                <ThirdPage />
              </>}
              navsPrimary={[
                {
                  icon: 'diagram-project',
                  iconPrefix: 'fas',
                  title: 'Spaces',
                  href: `/spaces`,
                  active: location.pathname.includes('/spaces')
                },
                {
                  icon: 'users',
                  iconPrefix: 'fas',
                  title: 'Personas',
                  href: `/personas`,
                  active: location.pathname.includes('/personas')
                },
                {
                  icon: 'user-circle',
                  iconPrefix: 'fas',
                  title: 'Profile',
                  href: `/profile`,
                  active: location.pathname.includes('/profile')
                },
              ]}
            />
      }
    </>
    
  )
}
