(function(){
	var app = angular.module('EncoreMovies',[]);
	
	/**************************
	  MAIN CONTROLLER
	**************************/
	app.controller("microMoviesController", ['$scope', '$http', '$rootScope', '$location', '$timeout' , function($scope, $http, $rootScope, $location, $timeout) {
		$http.get('data/movies.json').then(function(response) {
			$scope.movies = response.data;
		});
	}]);
	
	/**************************
	  DIRECTIVE FOR SLIDER
	**************************/
	app.directive('encoreMoviesSlider', ['$location', '$rootScope', '$timeout', function($location, $rootScope, $timeout) {
		var directive = {
			restrict: 'A',
			templateUrl: 'templates/slider.html',
			link: function($scope, $element, $attrs) {
				$scope.clickMovie = clickMovie;
				$scope.closeExpander = closeExpander;
				
				$scope.expanderDetails = undefined;	
				
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
				
				function clickMovie(movie, index) {
	                $scope.previewIsActive = false;
	                $scope.previewIsPlaying = false;
	                $scope.previewIsLoading = false;
	                $scope.previewIsWatched = false;
	
					if (movie.details) {
						if ($scope.expanderDetails && movie.details.Title === $scope.expanderDetails.Title && movie.details.Description === $scope.expanderDetails.Description) {
							
						} else {
							$scope.currentMovie = index;
							$scope.activeRowIndex = index;
							_onSliderSuccess(movie.details);
						}
						
					} else {
						$scope.isLoadingDetails = true;
						$scope.currentMovie = index;
						$scope.expanderDetails = {};
						getmovieDetail(movie.id)
					}
					
					$scope.activeRowIndex = $scope.rowIndex;
	                $timeout(function() {
	                    $scope.$apply();
	                });
	
	                function getMovieDetail(_id) {
		                console.log(_id);
	                }
	
	                function _onSliderSuccess(detailsObj) {
		                if (!movie.details) {
	                        movie.details = detailsObj;
	                    }
	                    $scope.isLoadingDetails = false;
	                    $scope.expanderDetails = detailsObj;
	                    $scope.videoShareTitle = movie.details.title;
	                    //$scope.videoShareUrl = $rootScope.getVideoUrl(movie.id, '', 'movie');
	                    //$scope._previewAddPlayer();
	                    //eventTrack("Expanded View", movie.details);
	
	                    if ($scope.addLocationHash) {
	                        $location.replace().hash($element.prop("id"));
	                    }
	                }
	
	                function _onSliderError(error) {
	                }
	            }	
	            
	            function closeExpander() {
		            $scope.currentMovie = -1;
		            $scope.previewIsPlaying = false;
		            $scope.previewIsWatched = false;
		            //if (jwplayer("expander-preview-row-" + $scope.rowIndex).getState) {
		                // jwplayer("expander-preview-row-" + $scope.rowIndex).setMute(true).stop();
		            //}
		        }
			}
		}
		return directive;	
	}]);
	 
	
})();