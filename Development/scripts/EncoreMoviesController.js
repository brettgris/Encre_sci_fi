(function(){
	var app = angular.module('EncoreMovies',[]);
	
	/**************************
	  MAIN CONTROLLER
	**************************/
	app.controller("microMoviesController", ['$scope', '$http', '$rootScope', '$location', '$timeout' , function($scope, $http, $rootScope, $location, $timeout) {
		var $body = $('body');
		
		$http.get('data/movies.json').then(function(response) {
			$scope.movies = response.data;
		});
		
		$body.addClass('movies-long-list');
		
		var $html = $('html');

	    $rootScope.referrer = '';
		$rootScope.isTouch = Modernizr.touch;
		$rootScope.isOldIE = $html.hasClass('lt-ie10');
		$rootScope.isFirefox = $html.hasClass('firefox');
		$rootScope.showModalMobileClose = false;
		
	    if (document.referrer) {
	        // We should check if the current URL is on the same domain.
	        (function() {
	            var pageReferrer = document.referrer.split('/')[2];
	    
	            if (pageReferrer === $location.host()) {
	                $rootScope.referrer = document.referrer;
	            }
	        })();
	    }
	    
	    // Orientation and mobile detection using Detectizr (https://github.com/barisaydinoglu/Detectizr)
	    // We have a manual handling behavior for orientation on desktop because it always reports landscape with that device type.
	    $rootScope.isPortrait = (Detectizr.device.orientation === 'portrait' || (Detectizr.device.type === 'desktop' && window.innerHeight >= window.innerWidth));
	    $rootScope.isLandscape = (Detectizr.device.orientation === 'landscape' || (Detectizr.device.type !== 'desktop' || window.innerHeight < window.innerWidth));
	    $rootScope.deviceType = Detectizr.device.type;
	    
	    // Kindle overrides in place for some of the device type information from what is laid out at https://confluence.starz.com/display/DPT/Mobile+Device+Detection
	    $rootScope.isMobile = Detectizr.device.type === 'mobile' || Detectizr.device.model === 'kindle';
	    $rootScope.isTablet = Detectizr.device.type === 'tablet' && Detectizr.device.model !== 'kindle';
	    $rootScope.isDesktop = Detectizr.device.type === 'desktop';
	    
	    // Doing a watch on Detectizr provides inconsistent results, and sometimes doesn't fire at all. We're instead watching this event, then giving some time for Detectizr to update its values before we recalculate ours.
	    jQuery(window).on('resize orientationchange', function() {
	        setTimeout(function() {
	            $rootScope.$apply(function() {
	                $rootScope.isPortrait = (Detectizr.device.orientation === "portrait" || (Detectizr.device.type === "desktop" && window.innerHeight >= window.innerWidth));
	                $rootScope.isLandscape = (Detectizr.device.orientation === "landscape" && (Detectizr.device.type !== "desktop" || window.innerHeight < window.innerWidth));
	            });
	        }, 10);
	    });
	    
	    $rootScope.$on('$locationChangeStart', function(e, absNew, absOld) {
	        var localizedOld, localizedNew;
	        absNew = absNew.replace(/\/((#|\?).*)?$/, ''); // remove trailing info and just look at the path
	        absOld = absOld.replace(/\/((#|\?).*)?$/, ''); // remove trailing info and just look at the path
	        if (absNew === absOld) {
	            return;
	        }
	    
	        $rootScope.referrer = absOld;
	    
	        // We need to ensure that the carousel images aren't reset when a user goes to a video link, and that they are not reset when going to the search page, so that the search page can maintain a carousel background when going to a preview video from within that context.
	        // This may need further extension for any other page where a user would navigate directly to another page that should never set a background.
	        // If the route we were coming from did not have a carousel image, and was not the video or search page.
	        if (!$rootScope.thisRouteHasCarousel && !absOld.match(/video/) && !absOld.match(/search/)) {
	            $rootScope.carouselImage = false;
	        }
	        $rootScope.thisRouteHasCarousel = false;
	    });
	    
	    $rootScope.getCascadedBackgroundImage = function() {
	        var toReturn = '/Content/img/bg/bokeh.jpg'; // Default;
	    
	        if ($rootScope.carouselImage) {
	            toReturn = $rootScope.carouselImage;
	        } else if (($rootScope.referrer.match(/originals\/[^/]+/) || $rootScope.referrer.match(/video/)) && $rootScope.originalImage) {
	            toReturn = $rootScope.originalImage;
	        }
	    
	        return toReturn;
	    };
	    
	    // Set up root scope functions.
	    //The following are breakpoints for image sizes as laid out in the Mobile Detection spec document above
	    $rootScope.isImageSizeSmall = function() {
	        if ($rootScope.isMobile) {
	            if ($rootScope.isPortrait) {
	                return jQuery(window).width() <= 768;
	            }
	    
	            return jQuery(window).width() <= 1280;
	        }
	    
	        return jQuery(window).width() <= 1024;
	    };
	    
	    $rootScope.isImageSizeMedium = function() {
	        if ($rootScope.isMobile) {
	            return jQuery(window).width() > 768; // no medium breakpoint for mobile..yet. Anything above small is large
	        }
	    
	        return (jQuery(window).width() > 1024 && jQuery(window).width() <= 1920);
	    };
	    
	    $rootScope.isImageSizeLarge = function() {
	        if ($rootScope.isMobile) {
	            if ($rootScope.isPortrait) {
	                return jQuery(window).width() > 768;
	            }
	    
	            return jQuery(window).width() > 1800;
	        }
	    
	        return jQuery(window).width() > 1920;
	    };
	    
	    //Image size as text value
	    $rootScope.imageSizeType = function() {
	        if ($rootScope.isMobile) {
	            return ($rootScope.isImageSizeSmall() ? 'small' :
	                $rootScope.isImageSizeLarge() ? 'large' : 'small');
	        }
	    
	        return ($rootScope.isImageSizeSmall() ? 'small' :
	            $rootScope.isImageSizeMedium() ? 'medium' :
	            $rootScope.isImageSizeLarge() ? 'large' : 'medium');
	    };
	    
	    $rootScope.trustedHtml = function(html) {
	        return $sce.trustAsHtml(html);
	    };
	    
	    $rootScope.forceSSL = function() {
	        if ($location.protocol() !== 'https') {
	            $window.location.href = $location.absUrl().replace('http', 'https');
	        }
	    };
	    
	    $rootScope.isActiveMenuLocation = function(locationFragment) {
	        var sanitizedLocationFragment = locationFragment.toString(); //.replace(/^#/, '');
	    
	        return (sanitizedLocationFragment.length > 0 && $location.path().indexOf(sanitizedLocationFragment) === 0);
	    };
	    
	    $rootScope.playFeaturedVid = function(videoId, originalString, subtype) {
	        $location.url($rootScope.getVideoUrl(videoId, originalString, subtype, true));
	    };
	    
	    $rootScope.getVideoUrl = function(videoId, originalString, subtype, localPath) {
	    
	        var path = '/video/';
	    
	        if (!videoId) {
	            return;
	        }
	    
	        if (originalString) {
	            path = '/originals/' + originalString + path + videoId;
	        } else if (subtype === "movie") {
	            path += 'movie/' + videoId;
	        } else if (subtype === "preview") {
	            path += 'preview/' + videoId;
	        } else {
	            path += videoId;
	        }
	    
	        if (!localPath) {
	            path = window.location.protocol + "//" + window.location.hostname + path;
	        }
	    
	        return path;
	    }
	    
	    $rootScope.closeModal = function() {
	        var defaultReroute = '/';
	        if ($rootScope.referrer) {
	            // We're local, so let's just allow the browser back button.
	            window.history.back();
	        } else {
	            // Now we have to be a bit more complicated for knowing where to go based on where we are.
	            if ($location.path().indexOf("/video/movie") === 0) {
	                // This is a top level video route, which means it is related to a movie. We can route to the movie detail by movie ID.
	                (function() {
	                    var movieId;
	    
	                    movieId = $location.path.match(/\/video\/movie\/([\d]+)/);
	    
	                    movieId = movieId[1];
	    
	                    $location.path("/movies/detail/" + movieId);
	                })();
	            } else if ($location.path().indexOf("/originals") === 0) {
	                // This is a route within an original, so we should kick the user to the originals homepage.
	                (function() {
	                    var originalsPath;
	    
	                    originalsPath = $location.path.match(/^\/originals\/[^/]/);
	    
	                    originalsPath = originalsPath[0];
	    
	                    $location.url(originalsPath);
	                })();
	            } else {
	                $location.url(defaultReroute);
	            }
	        }
	    }
	}]);
	
	/**************************
	  DIRECTIVE FOR SLIDER
	**************************/
	app.directive('encoreMoviesSlider', ['$location', '$rootScope', '$timeout', function($location, $rootScope, $timeout) {
		var directive = {
			restrict: 'A',
			templateUrl: 'templates/slider.html',
			link: function($scope, $element, $attrs) {
				// Link behaviors
	            var TIMEZONE = "America/New_York";
	
	            $scope.playFeaturedVid = $rootScope.playFeaturedVid;
	            $scope.isMobile = $rootScope.isMobile;
	            $scope.isTablet = $rootScope.isTablet;
	            $scope.clickMovie = clickMovie;
	            $scope.eventTrack = eventTrack;
	            $scope.showTimes = showTimes;
	            $scope.closeExpander = closeExpander;
	            $scope.isSelected = isSelected;
	            $scope.getDetailsAirTime = getDetailsAirTime;
	            $scope.getTruncatedSummary = getTruncatedSummary;
	            $scope.isInstantPreview = isInstantPreview;
	            $scope.getPlayerExpanderLink = getPlayerExpanderLink;
	            $scope.fullscreenVideo = fullscreenVideo;
	            $scope.getExpanderPath = getExpanderPath;
	            $scope.getExpanderSharePath = getExpanderSharePath;
	
	            $scope.expanderDetails = undefined;
	            $scope.isLoadingDetails = false;
	            $scope.currentMovie = -1;
	
	            // Video preview-specific vars.
	            $scope.previewIsActive = false;
	            $scope.previewIsLoading = false;
	            $scope.previewIsPlaying = false;
	            $scope.previewIsWatched = false;
	            $scope.previewIsMuted = true;
	
	            // Video preview-specific methods.
	            $scope.showPreviewVideo = showPreviewVideo;
	            $scope._previewAddPlayer = _previewAddPlayer;
	            $scope.previewStartVideo = previewStartVideo;
	            $scope.previewStopVideo = previewStopVideo;
	            $scope.previewShareVideo = previewShareVideo;
	            $scope.previewToggleMute = previewToggleMute;
				
				$scope.expanderDetails = undefined;	
				$scope.todayMoment = moment.tz(new Date(), TIMEZONE);
                $scope.currentDate = new Date($scope.todayMoment.format());
				
				$element.hide();
				function waitForDom(){
					$timeout(function(){
						$element.show();
						var $slides = $element.find(".movie-thumb");
						$element.css("max-width", $slides.filter(":first").outerWidth() * $slides.length);
						
						$element.slick({
                                slide: '.movie-thumb',
                                slidesToShow: 9,
                                slidesToScroll: 8,
                                lazyLoad: 'ondemand',
                                infinite: false,
                                responsive: [
                                	{
										breakpoint: 2149,
                                        settings: {
                                            slidesToShow: 8,
                                            slidesToScroll: 7
                                        }
                                    },{
                                        breakpoint: 1919,
                                        settings: {
                                            slidesToShow: 7,
                                            slidesToScroll: 6
                                        }
                                    },{
                                        breakpoint: 1799,
                                        settings: {
                                            slidesToShow: 6,
                                            slidesToScroll: 5
                                        }
                                    },{
                                        breakpoint: 1544,
                                        settings: {
                                            slidesToShow: 5,
                                            slidesToScroll: 4
                                        }
                                    },{
                                        breakpoint: 1289,
                                        settings: {
                                            slidesToShow: 4,
                                            slidesToScroll: 3
                                        }
                                    },{
                                        breakpoint: 1034,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 2
                                        }
                                    },{
                                        breakpoint: 779,
                                        settings: {
                                            slidesToShow: 2,
                                            slidesToScroll: 1
                                        }
                                    },{
                                        breakpoint: 640,
                                        settings: {
                                            slidesToShow: 4,
                                            slidesToScroll: 3
                                        }
                                    }, {
                                        breakpoint: 567,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 2
                                        }
                                    }, {
                                        breakpoint: 473,
                                        settings: {
                                            slidesToShow: 2,
                                            slidesToScroll: 1
                                        }
                                    }
                                ],
                            });
					},50);
				}
				
				waitForDom();	
				
				function isSelected(index) {
					return index === $scope.currentMovie;
				}
				
				function clickMovie(movie, index) {
	                $scope.previewIsActive = false;
	                $scope.previewIsPlaying = false;
	                $scope.previewIsLoading = false;
	                $scope.previewIsWatched = false;
	
					if (movie.details) {
						if ($scope.expanderDetails && movie.details.Title === $scope.expanderDetails.Title && movie.details.Description === $scope.expanderDetails.Description) {
							if (index === $scope.currentMovie) {
                            	closeExpander();
							} else {
                            	$scope.currentMovie = index;
								$scope.activeRowIndex = index;
								_onSliderSuccess(movie.details);
							}
						} else {
							$scope.currentMovie = index;
							$scope.activeRowIndex = index;
							_onSliderSuccess(movie.details);
						}	
					} else {
						
						
						$scope.isLoadingDetails = true;
						$scope.currentMovie = index;
						$scope.expanderDetails = {};
						getmovieDetail(movie.id);
					}
					
					$scope.activeRowIndex = $scope.rowIndex;
	                $timeout(function() {
	                    $scope.$apply();
	                });
	
	                function getMovieDetail(_id) {
		                $http.get('data/movies.json').then(
                        function(response) {
                            var md = $grep(response.data.Movies, function(i, o) {
                                if (o.id == _id) {
                                    return o;
                                }
                            })
                            _onSliderSuccess(md);
                        },function(response){
                        	_onSliderError(response);
                        });
	                }
	
	                function _onSliderSuccess(detailsObj) {
		            	if (!movie.details) {
	                        movie.details = detailsObj;
	                    }
	                    $scope.isLoadingDetails = false;
	                    $scope.expanderDetails = detailsObj;
	                    $scope.videoShareTitle = movie.details.title;
	                    $scope.videoShareUrl = $rootScope.getVideoUrl(movie.id, '', 'movie');
	                    $scope._previewAddPlayer();
	                    eventTrack("Expanded View", movie.details);
	
	                    if ($scope.addLocationHash) {
	                        $location.replace().hash($element.prop("id"));
	                    }
	                }
	
	                function _onSliderError(error) {
		                $scope.isLoadingDetails = false;
						$scope.currentMovie = -1;
	                }
	            }	
				
				function eventTrack(name, details) {
	                $.extend(details, {
	                    'Category': $scope.movieListTitle
	                }); // add Slider "Category" this movie is in.
	                //$analytics.eventTrack(name, details);
	            }
	            
	            function closeExpander() {
		            $scope.currentMovie = -1;
		            $scope.previewIsPlaying = false;
		            $scope.previewIsWatched = false;
		            //if (jwplayer("expander-preview-row-" + $scope.rowIndex).getState) {
		                // jwplayer("expander-preview-row-" + $scope.rowIndex).setMute(true).stop();
		            //}
		        }
	            
	            function showTimes(movie) {
	                /**
	                 * Display the show time in the desired format.
	                 **/
	                return moment.tz(movie.start, TIMEZONE).format("h:mm") + ' - ' + moment.tz(movie.end, TIMEZONE).format("h:mm a") + ' EST';
	            }
	
	            function showPreviewVideo() {
	                var shouldShowPreviewVideo = true;
	
	                if ($scope.isMobile || $scope.isTablet) {
	                    shouldShowPreviewVideo = false;
	                } else if (!$scope.expanderDetails) {
	                    shouldShowPreviewVideo = false;
	                } else if (!$scope.expanderDetails.hasPreview) {
	                    shouldShowPreviewVideo = false;
	                } else if ($scope.expanderDetails.type.toLowerCase() === "movie" && !$scope.expanderDetails.instantPreviewUrl) {
	                    shouldShowPreviewVideo = false;
	                } else if (!$scope.expanderDetails.instantPreviewUrl && !$scope.expanderDetails.fullPreviewUrl) {
	                    shouldShowPreviewVideo = false;
	                }
	
	                return shouldShowPreviewVideo;
	            }
	
	            function getDetailsAirTime() {
		            console.log( 'AIR TIME: ' );
		            
	                var dateString = '',
	                    dateStart,
	                    start,
	                    end;
	
	                if (!movie) {
	                    return '';
	                }
	
	                dateStart = moment.tz($scope.currentDate, TIMEZONE);
	                start = moment(movie.AirDateTime);
	                //end = moment(movie.end);
	
	                if ($scope.todayMoment.year() === start.year() && $scope.todayMoment.month() === start.month() && $scope.todayMoment.date() === start.date()) {
	                    dateString += 'Today';
	                } else {
	                    dateString += start.format("M.D");
	                }
	
	                dateString += start.format(" @ h:mma") + " EST";
					
					
					
	                return dateString;
	            }
	            
	            function previewToggleMute() {
	                var player = jwplayer("expander-preview-row-" + $scope.rowIndex);
	                $scope.previewIsMuted = !$scope.previewIsMuted;
	                player.setMute($scope.previewIsMuted);
	            }
	
	            function isInstantPreview() {
	                return (!!$scope.expanderDetails.instantPreviewUrl);
	            }
	
	            function getPlayerExpanderLink() {
	                var videoLink = '';
	                if ($scope.expanderDetails.type === "movie") {
	                    if ($scope.expanderDetails.instantPreviewUrl) {
	                        videoLink = '/video/preview/' + $scope.expanderDetails.id;
	                    } else if ($scope.expanderDetails.fullPreviewUrl) {
	                        videoLink = '/video/movie/' + $scope.expanderDetails.id;
	                    }
	                }
	
	                return videoLink;
	            }
	            
	            function _previewAddPlayer() {
	                if ($scope.expanderDetails && $scope.expanderDetails.hasPreview && showPreviewVideo()) {
	                    $timeout(function() {
	
	                        var player = jwplayer("expander-preview-row-" + $scope.rowIndex),
	                            $loader = $('.loading-content');
	
	                        $loader.starzLoader('show');
	
	                        $scope.previewIsActive = true;
	                        $scope.previewIsMuted = true;
	
	                        // Setup JWPlayer.
	                        player.setup({
	                            autostart: true,
	                            repeat: false,
	                            controls: false,
	                            flashplayer: "/Scripts/Vendor/jwplayer/player.swf",
	                            width: '100%',
	                            aspectratio: '16:9',
	                            assetName: 'Feature Video',
	                            stretching: "fill",
	                            mute: $scope.previewIsMuted,
	                            androidhls: true,
	                            primary: 'html5',
	                            playlist: [{
	                                image: $scope.expanderDetails.landscapeImage,
	                                sources: [{
	                                    file: ($scope.expanderDetails.instantPreviewUrl) ? $scope.expanderDetails.instantPreviewUrl : $scope.expanderDetails.fullPreviewUrl
	                                }]
	                            }]
	                        }).onBuffer(function(e) {
	                            $timeout(function() {
	                                // This is redundant for current flow, but could
	                                // prevent bugs later if things are added/changed.
	                                $scope.previewIsLoading = true;
	                                $scope.$apply();
	                            }, 1);
	                        }).onIdle(function(e) {
	                            $timeout(function() {
	                                $scope.previewIsLoading = false;
	                                $scope.previewIsPlaying = false;
	                            }, 1);
	                        }).onReady(function() {
	                            $timeout(function() {
	                                $scope.previewStartVideo();
	                            }, 1);
	
	                        }).onPlay(function() {
	                            $timeout(function() {
	                                $scope.previewIsLoading = false;
	                                $scope.previewIsPlaying = true;
	                                $scope.$apply();
	                            }, 1);
	                        }).onComplete(function() {
	                            $timeout(function() {
	                                $scope.previewIsActive = false;
	                                $scope.previewIsPlaying = false;
	                                $scope.previewIsLoading = false;
	                                $scope.previewIsWatched = true;
	                                $scope.$apply();
	                            }, 1);
	                        });
	                    }, 10);
	                }
	            }
	            
	            /** 
	             * Start video if idle, resume playback if paused.
	             */
	            function previewStartVideo() {
	
	                // Get player object based on current player selector.
	                var player = jwplayer("expander-preview-row-" + $scope.rowIndex);
	
	                // If already playing or buffering or there's no video, just return.
	                if (!$scope.showPreviewVideo() || 'PLAYING' === player.getState() || 'BUFFERING' === player.getState()) {
	                    return;
	                }
	
	                $scope.previewIsPlaying = true;
	                $scope.previewIsActive = true;
	                $scope.previewIsLoading = true;
	
	                // If no player present, add one.
	                if ('undefined' === typeof player.getState()) {
	                    $scope._previewAddPlayer();
	                } else {
	                    // Otherwise, the state must be idle or paused and we should play vid.
	                    if ('IDLE' === player.getState() || 'PAUSED' === player.getState()) {
	                        player.play(true);
	                    }
	                    return;
	                }
	            }
	
	            /**
	             * Pause playback of preview video.
	             */
	            function previewPauseVideo() {
	                // Delay this slightly so it isn't ignored in certain cases.
	                $timeout(function() {
	                    $scope.previewIsLoading = false;
	                    var player = jwplayer("expander-preview-row-" + $scope.rowIndex);
	                    player.pause(true);
	                }, 500);
	            }
	
	            /**
	             * Stop playback of preview video (sets as IDLE).
	             */
	            function previewStopVideo() {
	                $scope.previewIsLoading = false;
	                var player = jwplayer("expander-preview-row-" + $scope.rowIndex);
	                player.stop();
	            }
	
	            /**
	             * Share preview video.
	             */
	            function previewShareVideo() {
	                // @TODO
	            }
	
	            function fullscreenVideo($event, isPreview) {
	                var playVidArgs = {};
	
	                playVidArgs.id = $scope.expanderDetails.mediaId;
	
	                if ($scope.expanderDetails.type.toLowerCase() === "movie") {
	                    playVidArgs.origString = '';
	
	                    playVidArgs.subtype = (isPreview ? 'preview' : 'movie');
	                    $scope.playFeaturedVid(playVidArgs.id, playVidArgs.origString, playVidArgs.subtype);
	                } else if ($scope.expanderDetails.type.toLowerCase() === 'original') {
	                    $scope.playFeaturedVid(playVidArgs.id, $scope.expanderDetails.routeName);
	                }
	            }
	
	            function getExpanderPath(expanderDetails) {
					if (expanderDetails.Type.toLowerCase() === "movie") {
	                    return "/movies/detail/" + expanderDetails.routeName;
	                } else if (expanderDetails.Type.toLowerCase() === "original") {
	                    return "/originals/" + expanderDetails.routeName + "/featured";
	                } else {
	                    return undefined;
	                }
	            }
	
	            function getExpanderSharePath(expanderDetails) {
	                if (expanderDetails.type.toLowerCase() === "movie") {
	                    return window.location.protocol + "//" + window.location.hostname + "/movies/detail/" + expanderDetails.routeName;
	                } else if (expanderDetails.type.toLowerCase() === "original") {
	                    return window.location.protocol + "//" + window.location.hostname + "/originals/" + expanderDetails.routeName + "/featured";
	                } else {
	                    return undefined;
	                }
	            }
	
	            function getTruncatedSummary(text, maxLength) {
	                var substr = text;
	
	                if (substr && substr.length > maxLength) {
	                    substr = (substr.substring(0, maxLength).match(/^.*[\W]?[\s]/)[0]).replace(/[\W]?[\s]*$/, '...');
	                }
	
	                return substr;
	            }
			}
		}
		return directive;	
	}]);
	 
	
})();