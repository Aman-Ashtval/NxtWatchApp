import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'

import {formatDistanceToNow} from 'date-fns'
import {AiOutlineLike, AiOutlineDislike} from 'react-icons/ai'
import {RiPlayListAddLine} from 'react-icons/ri'

import Header from '../Header'
import LeftBar from '../LeftBar'
import AppContext from '../../context/AppContext'

import {
  BgContainer,
  VideoDetailsContainer,
  RightContainer,
  Player,
  Heading,
  FlexContainer,
  ParagraphEl,
  DotIcon,
  Container,
  ResponseButton,
  ChannelContainer,
  ProfileImage,
  TextContainer,
  Name,
  Title,
  Description,
  LoaderContainer,
  ImageEl,
  FailureHeading,
  FailureDescription,
  RetryButton,
} from './styledComponent'

// api constant values
const responseConstants = {
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
  initial: 'INITIAL',
}

class VideoItemDetails extends Component {
  state = {
    videoDetails: {},
    responseStatus: responseConstants.initial,
    isLike: false,
    isDislike: false,
    isSaved: false,
  }

  componentDidMount() {
    this.getVideoDetails()
  }

  getFilterObject = obj => {
    const filterObj = {
      id: obj.id,
      publishedAt: obj.published_at,
      thumbnailUrl: obj.thumbnail_url,
      title: obj.title,
      videoUrl: obj.video_url,
      totalView: obj.view_count,
      description: obj.description,
      channel: {
        name: obj.channel.name,
        profileImageUrl: obj.channel.profile_image_url,
        subscriberCount: obj.channel.subscriber_count,
      },
    }
    return filterObj
  }

  getVideoDetails = async () => {
    this.setState({responseStatus: responseConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {match} = this.props
    const {params} = match
    const {id} = params
    const api = `https://apis.ccbp.in/videos/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(api, options)
    if (response.ok) {
      const data = await response.json()
      const videoDetails = this.getFilterObject(data.video_details)
      this.setState({videoDetails, responseStatus: responseConstants.success})
    } else {
      this.setState({responseStatus: responseConstants.success})
    }
  }

  // toggle like, dislike and saved icons---------------------------------------------->
  toggleLike = () => {
    this.setState(prevState => ({isLike: !prevState.isLike}))
  }

  toggleDisLike = () => {
    this.setState(prevState => ({isDislike: !prevState.isDislike}))
  }

  // get the successView of video
  getSuccessView = () => (
    <AppContext.Consumer>
      {value => {
        const {lightTheme, saveVideo} = value

        const {videoDetails, isLike, isDislike, isSaved} = this.state
        const {
          videoUrl,
          title,
          totalView,
          publishedAt,
          channel,
          description,
        } = videoDetails
        const {name, profileImageUrl, subscriberCount} = channel

        const saveButtonText = isSaved ? 'Saved' : 'Save'

        // save video method calling
        const toggleSave = () => {
          this.setState(prevState => ({isSaved: !prevState.isSaved}))
          saveVideo({...videoDetails})
        }

        return (
          <>
            <Player url={videoUrl} controls width="100%" />
            <Heading lightTheme={lightTheme}>{title}</Heading>
            <FlexContainer>
              <Container>
                <ParagraphEl>{totalView} views</ParagraphEl>
                <DotIcon />
                <ParagraphEl>
                  {formatDistanceToNow(new Date(publishedAt))}
                </ParagraphEl>
              </Container>
              <Container>
                <ResponseButton isFill={isLike} onClick={this.toggleLike}>
                  <AiOutlineLike
                    fontSize="18px"
                    style={{margin: '0px 3px 0px 0px'}}
                  />
                  Like
                </ResponseButton>
                <ResponseButton isFill={isDislike} onClick={this.toggleDisLike}>
                  <AiOutlineDislike
                    fontSize="18px"
                    style={{margin: '0px 3px'}}
                  />
                  DisLike
                </ResponseButton>
                <ResponseButton isFill={isSaved} onClick={toggleSave}>
                  <RiPlayListAddLine
                    fontSize="18px"
                    style={{margin: '0px 5px'}}
                  />
                  {saveButtonText}
                </ResponseButton>
              </Container>
            </FlexContainer>
            {/* channel details render here-------------------------------------> */}
            <ChannelContainer>
              <ProfileImage src={profileImageUrl} alt={name} />
              <TextContainer>
                <Name as="p" lightTheme={lightTheme}>
                  {name}
                </Name>
                <Title lightTheme={lightTheme}>
                  {subscriberCount} Subscribers
                </Title>
                <Description lightTheme={lightTheme}>{description}</Description>
              </TextContainer>
            </ChannelContainer>
          </>
        )
      }}
    </AppContext.Consumer>
  )

  // render failure view
  getFailureView = () => (
    <AppContext.Consumer>
      {value => {
        const {lightTheme} = value

        return (
          <LoaderContainer>
            {lightTheme ? (
              <ImageEl
                src="https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-light-theme-img.png"
                alt="failure view"
              />
            ) : (
              <ImageEl
                src="https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-dark-theme-img.png"
                alt="failure view"
              />
            )}
            <FailureHeading lightTheme={lightTheme}>
              Oops! Something Went Wrong
            </FailureHeading>
            <FailureDescription>
              We are having some trouble to complete your request. Please try
              again.
            </FailureDescription>
            <RetryButton onClick={this.getVideoDetails}>Retry</RetryButton>
          </LoaderContainer>
        )
      }}
    </AppContext.Consumer>
  )

  // render Loader view
  getLoadingView = () => (
    <LoaderContainer data-testid="loader">
      <Loader type="ThreeDots" color=" #4f46e5" height="50" width="50" />
    </LoaderContainer>
  )

  getVideoDetailsView = () => {
    const {responseStatus} = this.state

    switch (responseStatus) {
      case responseConstants.success:
        return this.getSuccessView()
      case responseConstants.inProgress:
        return this.getLoadingView()
      case responseConstants.failure:
        return this.getFailureView()

      default:
        return null
    }
  }

  render() {
    return (
      <AppContext.Consumer>
        {value => {
          const {lightTheme} = value

          return (
            <BgContainer lightTheme={lightTheme} data-testid="videoItemDetails">
              <Header />
              <VideoDetailsContainer>
                <LeftBar />
                <RightContainer>{this.getVideoDetailsView()}</RightContainer>
              </VideoDetailsContainer>
            </BgContainer>
          )
        }}
      </AppContext.Consumer>
    )
  }
}

export default VideoItemDetails
