//POSTS
var Posts = function() {
	var self = this;
	self.latest = ko.observableArray([]);
	self.groups = ko.observableArray([]);
	self.selectedGroup = null;
	self.photo = null;
	self.video = null;
	self.image_progress = ko.observable(0);
	self.video_progress = ko.observable(0);
	var image_options = {
		quality:75,
		destinationType : 1,
		targetHeight:600,
		targetWidth:600,
		saveToPhotoAlbum: true
	};

	self.init = function() {
		//load latest
	}

	self.update = function() {
		router.load('latest/'+viewModel.user.user_id,null,self.updateProcess);
	}

	self.updateProcess = function(data) {
		self.latest([]);
		$.each(data.data, function(index,item) {
			self.latest.push(item);
		});
	}

	self.create = function() {
		//check groups
		router.load('categories/'+viewModel.user.user_id,null,self.createProcess);
	}

	self.createProcess = function(data) {
		self.groups([]);
		if(data.data.length > 0) {
			if(data.data.length == 1) {
				self.selectedGroup = item.OrganizationDepartment.id;
				router.loadPage('type?group='+item.OrganizationDepartment.id);
			} else {
				$.each(data.data,function(index,item) {
					self.groups.push({
						title: item.OrganizationDepartment.title,
						id: item.OrganizationDepartment.id
					});
				});
				router.loadPage('groups');
			}
		} else {
			navigator.notification.alert('Your user does not have access to any Categories to post to. Please contact your administrator.');
			router.loadPage('start');
		}
	}

	self.loadPost = function() {
		$('#form_post').validate({
			submitHandler: function(data) {
				cordova.plugins.Keyboard.close();
				self.formPost(data);
			}
		});
	}

	self.formPost = function(formData) {
		router.load('add/'+viewModel.user.user_id, $(formData).serialize(),function(data) {
			self.update();
			$('#post_title, #post_text').val('');
			router.loadPage('start');
		});
	}

	self.loadPhoto = function() {
		$('#form_photo').validate({
			submitHandler: function(data) {
				cordova.plugins.Keyboard.close();
				self.formPhoto(data);
			}
		});
	}

	self.formPhoto = function(formData) {
		//single option when must be deferred or will auto pass
		$.when(self.image_upload(self.photo)).then(function() {
			//UPLOAD POST
			router.load('add/'+viewModel.user.user_id, $(formData).serialize(),function(data) {
				self.update();
				$('#image_id, #photo_title, #photo_text').val('');
				$('#photo_thumbnail').attr('src','img/empty_photo.png');
				self.image_progress(0);
				router.loadPage('start');
			});
		});
	}

	self.takePhoto = function() {
		image_options.sourceType = Camera.PictureSourceType.CAMERA;
		image_options.mediaType = Camera.MediaType.PICTURE;
		image_options.saveToPhotoAlbum = true;
		navigator.camera.getPicture(self.processPhoto,null,image_options);
	}

	self.getPhoto = function() {
		image_options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
		image_options.mediaType = Camera.MediaType.PICTURE;
		image_options.saveToPhotoAlbum = false;
		navigator.camera.getPicture(self.processPhoto,null,image_options);
	}

	self.image_upload = function(imageURI) {
		return $.Deferred(function() {
			var defself = this;
			try {
				var ft = new FileTransfer();
				var options = new FileUploadOptions();
				var key = Date.now();
				options.fileKey = 'media';
				options.fileName = key+'.jpg';
				options.mimeType = "image/jpeg";
				options.params = {
						user:viewModel.user.user_id
				};
				options.chunkedMode = true;
				ft.upload(
					imageURI,
					'http://'+viewModel.user.domain+'/ajax/plugin/media/media/uploader/MediaImage/?uploader='+options.fileName,
					function(data) {
						if(data.responseCode == 200) {
							try {
								json = JSON.parse(data.response);
								$('#image_id').val(json.id);
								defself.resolve();
							} catch(e) {
								viewModel.log(e);
							}
						} else {
							navigator.notification.alert('There was an error communicating with the server.');
						}
					},
					function(error) {
						switch(error.code) {
							case FileTransferError.FILE_NOT_FOUND_ERR:
								reason = 'File not found.';
								break;
							case FileTransferError.INVALID_URL_ERR:
								reason = 'Invalid URL.';
								break;
							case FileTransferError.CONNECTION_ERR:
								reason = 'Connection Problem.';
								break;
							case FileTransferError.ABORT_ERR:
								reason = 'Transfer Aborted.';
								break;
						}
						viewModel.log('ERROR: '+item.data.claimFileID+' had an error uploading: ' + reason + '<br />' + error.source + ':' + error.target + ':' + error.http_status);
					},
					options
				);

				ft.onprogress = function(progressEvent) {
					if (progressEvent.lengthComputable) {
						var percentageComplete = progressEvent.loaded / progressEvent.total;
						self.image_progress(percentageComplete * 100);
					}
				}
			} catch(e) {
				console.log(e);
				viewModel.log(e);
			}
		});
	}
		
	self.processPhoto = function(imageURI) {
		$('#photo_thumbnail').attr('src',imageURI);
		self.photo = imageURI;
	}
	
	self.loadVideo = function() {
		$('#form_video').validate({
			submitHandler: function(data) {
				cordova.plugins.Keyboard.close();
				self.formVideo(data);
			}
		});
	}

	self.formVideo = function(formData) {
		//single option when must be deferred or will auto pass
		console.log('starting when')
		$.when(self.video_upload(self.video)).then(function() {
			//UPLOAD POST
			router.load('add/'+viewModel.user.user_id, $(formData).serialize(),function(data) {
				self.update();
				$('#video_id, #video_title, #video_text').val('');
				$('#video_thumbnail').attr('src','').attr('poster','img/empty_photo.png');
				self.video_progress(0);
				router.loadPage('start');
			});
		});
	}

	self.video_upload = function(videoURI) {
		return $.Deferred(function() {
			var defself = this;
			try {
				$('#loading').show();
				var ft = new FileTransfer();
				var options = new FileUploadOptions();
				var domain = viewModel.user.domain;
				var url = 'http://'+domain+'/ajax/plugin/media/media/';
				var timestamp = Date.now();
				var basename = 'gbapp_'+viewModel.user.user_id+'_'+timestamp;
				var filename = basename+'.m4v';
				options.fileKey = 'media';
				options.uploader = 'test';
				options.fileName = filename;
				var params = {
					"auth":{
						"key":'4cdc5c60f7284d9cae526bff72ec3211'
					},
					"template_id":'9424fda8623a4fd3a7b1f29f4b277d84',
					notify_url: url+'complete/MediaVideo',
					"steps":{},
					"fields":{
						"domain":viewModel.domainkey,
						"basename":basename
					}
				};
				options.params = {params:JSON.stringify(params)};

				options.chunkedMode = true;
				
				ft.upload(
					videoURI,
					'http://api2.transloadit.com/assemblies',
					function(data) {
						if(data.responseCode == 200) {
							$('#loading').fadeOut();
							try {
								json = JSON.parse(data.response);
								if(json.assembly_url) {
									$('#loading').show();
									$.ajax({
										url: url+'save/'+filename+'/MediaVideo/'+viewModel.user.user_id,
										data: json,
										success:function(savedata,status) {
											$('#loading').fadeOut();
											if(status == "success") {
												tmpjson = JSON.parse(savedata);
												$('#video_id').val(tmpjson.id);
												defself.resolve();
											} else {
												alert(status);
												return;
											}
										},
										async:false
									});
								}
							} catch(e) {
								viewModel.log(e);
							}
						} else {
							navigator.notification.alert('There was an error communicating with the server.');
						}
					},
					function(error) {
						switch(error.code) {
							case FileTransferError.FILE_NOT_FOUND_ERR:
								reason = 'File not found.';
								break;
							case FileTransferError.INVALID_URL_ERR:
								reason = 'Invalid URL.';
								break;
							case FileTransferError.CONNECTION_ERR:
								reason = 'Connection Problem.';
								break;
							case FileTransferError.ABORT_ERR:
								reason = 'Transfer Aborted.';
								break;
						}
						viewModel.log(error);
					},
					options
				);

				ft.onprogress = function(progressEvent) {
					if (progressEvent.lengthComputable) {
						var percentageComplete = progressEvent.loaded / progressEvent.total;
						self.video_progress(percentageComplete * 100);
					}
				}
			} catch(e) {
				viewModel.log(e);
			}
		});
	}

	self.takeVideo = function() {
		navigator.device.capture.captureVideo(function(videoObj) {
			var videoURI = 'file://'+videoObj[0].fullPath;
			self.processVideo(videoURI);
		}, function(data) {
			viewModel.log(['Error capturing video',data]);
		});
	}

	self.getVideo = function() {
		image_options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
		image_options.mediaType = Camera.MediaType.VIDEO;
		image_options.saveToPhotoAlbum = false;
		navigator.camera.getPicture(self.processVideo,null,image_options);
	}
		
	self.processVideo = function(videoURI) {
		$('#video_thumbnail').attr('src',videoURI).attr('poster',null);
		self.video = videoURI;
	}
	
	self.init();
	//$('input[type=submit]').attr('disabled','disabled')
	//$('input[type=submit]').attr('disabled',false)
}
