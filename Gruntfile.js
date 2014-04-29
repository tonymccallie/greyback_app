module.exports = function(grunt) {
	grunt.initConfig({
		less: {
			development: {
				options: {
					paths: ['./www/css','./www/uikit']
				},
				files: {
					'./www/css/styles.css': './www/css/styles.less'
				}
			},
			production: {
				options: {
					paths: ['./www/css','./www/uikit'],
					cleancss: true
				},
				files: {
					'./www/css/styles.min.css': './www/css/styles.less'
				}
			},
		},
        concat: {
            development: {
                options: {
                    separator: "\n\n"
                },
                src: [
                    "./www/js/lib/jquery-2.1.0.min.js",
                    "./www/js/lib/knockout-3.1.0.js",
                    "./www/js/lib/google.fastbutton.js",
                    "./www/js/lib/pager.min.js",
                    "./www/uikit/js/core.js",
                    "./www/uikit/js/utility.js",
                    "./www/uikit/js/touch.js",
                    "./www/uikit/js/alert.js",
                    "./www/uikit/js/button.js",
                    "./www/uikit/js/dropdown.js",
                    "./www/uikit/js/grid.js",
                    "./www/uikit/js/modal.js",
                    "./www/uikit/js/offcanvas.js",
                    "./www/uikit/js/nav.js",
                    "./www/uikit/js/tooltip.js",
                    "./www/uikit/js/switcher.js",
                    "./www/uikit/js/tab.js",
                    "./www/uikit/js/scrollspy.js",
                    "./www/uikit/js/smooth-scroll.js",
                    "./www/uikit/js/toggle.js",
                    "./www/js/util/router.js",
                    "./www/js/models/*.js",
                    "./www/js/config.js",
                    "./www/js/app.js",
                ],
                dest: "./www/js/custom.js"
            }
        },
		watch: {
			css: {
				files: ['./www/css/*.less','./www/uikit/less/*.less'],
				tasks: ['less'],
				options: {
					livereload: true
				}
			},
			html: {
				files: ['./www/*.html','./www/views/*.html'],
				options: {
					livereload: true
				}
			},
            js: {
                files: ['./www/js/*.js','./www/js/models/*.js','./www/js/util/*.js','!./www/js/custom.js'],
                tasks: ['concat'],
                options: {
                    livereload: true   
                }
            }
        }
    });
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['less:production']); //, 'uglify:production', 'replace'
};