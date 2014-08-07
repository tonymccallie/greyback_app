var Router = function() {
	var self = this;

	self.loadPage = function(page) {
		window.location.hash = '#!/'+page;
	}

	self.load = function(url,data,callback) {
		var domain = null;
		if(viewModel.user.domain === null) {
			if($('#login_domain').val().length) {
				domain = $('#login_domain').val();
			} else {
				navigator.notification.alert('Please enter a valid domain name.');
				return false;
			}
		} else {
			domain = viewModel.user.domain;
		}
		var url = 'http://'+domain+'/ajax/plugin/community/community_posts/'+url;
		$('#loading').show();
		var quiet = true;
		var options = {
			url: url,
			crossDomain: true,
			success: function (data) {
				if(data.status === "SUCCESS") {
					callback(data);
				} else {
					navigator.notification.alert(data.message);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				switch(jqXHR.status) {
					case 404:
						navigator.notification.alert('That domain is not accepting GreyBack logins');
						break;
					default:
						viewModel.log([jqXHR, textStatus, errorThrown]);
						pager.navigate('#!/debug');
				}
			},
			complete: function(jqXHR, textStatus, errorThrown) {
				if((textStatus != 'success')&&(!quiet)) {
					alert(errorThrown);
					//navigator.notification.alert('There was a problem communicating with the server.',null,'GroupPost');
				}
				$('#loading').fadeOut();
				$('#refresh i').removeClass('icon-spin');
			},
			dataType: 'json',
			async: true
		};

		if(typeof data === 'undefined') {
			options.type = 'GET';
		} else {
			options.type = 'POST';
			options.data = data;
		}

		try {
			return($.ajax(options));
		} catch(e) {
			alert(e);
		}
	}
	
	self.transloadit = function(videoURI) {
		return $.Deferred(function() {
			var defself = this;
			var domain = viewModel.user.domain;


			//Get Filename
			var filename = 'greybackapp'+viewModel.user.user_id+'.m4v';

			var url = 'http://'+domain+'/ajax/plugin/media/media/';
			$.ajax({
				url: url+'filename/'+filename+'/MediaVideo',
				success:function(data,status) {
					if(status == "success") {
						tmpjson =JSON.parse(data);
						filename = tmpjson.filename;
					} else {
						alert(data);
					}
				},
				async:false
			});

			dotPos = filename.lastIndexOf(".");
			basename = filename.substr(0,dotPos);

			params = {
				"auth":{
					"key":'4cdc5c60f7284d9cae526bff72ec3211'
				},
				"template_id":'9424fda8623a4fd3a7b1f29f4b277d84',
				notify_url: url+'/complete/MediaVideo',
				"steps":{},
				"fields":{
					"domain":viewModel.domainkey,
					"basename":basename
				}
			};

			params = JSON.stringify(params);


			var xhr = new XMLHttpRequest();
			xhr.upload.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					var percentageComplete = progressEvent.loaded / progressEvent.total;
					viewModel.posts.video_progress(percentageComplete * 100);
				}
			}

			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					if(xhr.responseText) {
						json = JSON.parse(xhr.responseText);
						if(json.ok) {
							$.ajax({
								url: url+'save/'+filename+'/MediaVideo/'+viewModel.user.user_id,
								data: json,
								success:function(data,status) {
									if(status == "success") {
										tmpjson = JSON.parse(data);
										$('#video_id').val(tmpjson["id"]);
										defself.resolve();
									} else {
										alert(status);
										return;
									}
								},
								async:false
							});
						} else {
							alert(json.message);
						}
						$('#video_id').val();
					} else {
						alert('error');
					}
				}
			};

			var form = new FormData();
			form.append('uploader',file.name);
			form.append('media', file);
			form.append('params',params);
			xhr.open("POST", 'http://api2.transloadit.com/assemblies', true);
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.send(form);
		});
	}
}
