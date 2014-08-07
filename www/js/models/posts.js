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
				self.formPost(data);
			}
		});
	}

	self.formPost = function(formData) {
		router.load('add/'+viewModel.user.user_id, $(formData).serialize(),function(data) {
			self.update();
			router.loadPage('start');
		});
	}

	self.loadPhoto = function() {
		$('#form_photo').validate({
			submitHandler: function(data) {
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
				self.formVideo(data);
			}
		});
	}

	self.formVideo = function(formData) {
		//single option when must be deferred or will auto pass
		$.when(self.video_upload(self.video)).then(function() {
			//UPLOAD POST
			router.load('add/'+viewModel.user.user_id, $(formData).serialize(),function(data) {
				self.update();
				router.loadPage('start');
			});
		});
	}

	self.takeVideo = function() {
		navigator.device.capture.captureVideo(self.processVideo, function(data) {
			viewModel.log(data);
		});
	}

	self.getVideo = function() {
		image_options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
		image_options.mediaType = Camera.MediaType.VIDEO;
		image_options.saveToPhotoAlbum = false;
		navigator.camera.getPicture(self.processVideo,null,image_options);
	}

	self.video_upload = function(videoURI) {
		return $.Deferred(function() {
			viewModel.log(videoURI);
		});
	}
		
	self.processVideo = function(videoURI) {
		$('#video_thumbnail').attr('src',videoURI).attr('poster',null);
		self.video = videoURI;
	}
	
	self.init();
	//$('input[type=submit]').attr('disabled','disabled')
	//$('input[type=submit]').attr('disabled',false)
}
