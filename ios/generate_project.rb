#!/usr/bin/env ruby
# Generates ios/SubTrakt/SubTrakt.xcodeproj from the Swift sources under
# ios/SubTrakt/SubTrakt/. This is the project's "source of truth" in place
# of XcodeGen/CocoaPods (deliberately avoided, see ios/README if present) —
# re-run this any time Swift files are added, removed, or moved.
#
# Usage: ruby ios/generate_project.rb
require 'xcodeproj'

ROOT = File.expand_path('SubTrakt', __dir__)
PROJECT_PATH = File.join(ROOT, 'SubTrakt.xcodeproj')
SOURCE_ROOT = File.join(ROOT, 'SubTrakt')
BUNDLE_ID = 'com.mattheriault.SubTrakt'
DEPLOYMENT_TARGET = '17.0'
DEVELOPMENT_TEAM = '3PJ4Q58Z3W' # set via Xcode's Signing & Capabilities tab; kept here so regenerating the project doesn't drop it
MARKETING_VERSION = '1.0' # user-visible version shown on the App Store / TestFlight
CURRENT_PROJECT_VERSION = '4' # build number; must increase on every TestFlight/App Store upload

File.delete(PROJECT_PATH) if File.exist?(PROJECT_PATH) && !File.directory?(PROJECT_PATH)

project = Xcodeproj::Project.new(PROJECT_PATH)
target = project.new_target(:application, 'SubTrakt', :ios, DEPLOYMENT_TARGET)

main_group = project.main_group.new_group('SubTrakt', SOURCE_ROOT)

def add_dir(project, target, group, dir)
  Dir.entries(dir).sort.each do |entry|
    next if entry.start_with?('.')
    full_path = File.join(dir, entry)
    if File.directory?(full_path)
      if entry.end_with?('.xcassets')
        ref = group.new_reference(full_path)
        target.resources_build_phase.add_file_reference(ref)
      else
        subgroup = group.new_group(entry, full_path)
        add_dir(project, target, subgroup, full_path)
      end
    elsif entry.end_with?('.swift')
      ref = group.new_reference(full_path)
      target.source_build_phase.add_file_reference(ref)
    elsif entry.end_with?('.xcprivacy')
      # Privacy manifest — required by App Store Connect; must be copied into the bundle.
      ref = group.new_reference(full_path)
      target.resources_build_phase.add_file_reference(ref)
    end
  end
end

add_dir(project, target, main_group, SOURCE_ROOT)

target.build_configurations.each do |config|
  bs = config.build_settings
  bs['PRODUCT_BUNDLE_IDENTIFIER'] = BUNDLE_ID
  bs['SWIFT_VERSION'] = '5.0'
  bs['IPHONEOS_DEPLOYMENT_TARGET'] = DEPLOYMENT_TARGET
  bs['TARGETED_DEVICE_FAMILY'] = '1,2'
  bs['GENERATE_INFOPLIST_FILE'] = 'YES'
  bs['INFOPLIST_KEY_CFBundleDisplayName'] = 'DueDate'
  bs['INFOPLIST_KEY_UILaunchScreen_Generation'] = 'YES'
  bs['INFOPLIST_KEY_UIApplicationSceneManifest_Generation'] = 'YES'
  bs['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  bs['ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME'] = 'AccentColor'
  bs['CODE_SIGN_STYLE'] = 'Automatic'
  bs['DEVELOPMENT_TEAM'] = DEVELOPMENT_TEAM
  bs['MARKETING_VERSION'] = MARKETING_VERSION
  bs['CURRENT_PROJECT_VERSION'] = CURRENT_PROJECT_VERSION
  bs['INFOPLIST_KEY_ITSAppUsesNonExemptEncryption'] = 'NO' # skips the manual export-compliance prompt on upload; the app does no custom encryption beyond standard OS/HTTPS
  bs['INFOPLIST_KEY_UIRequiresFullScreen'] = 'YES' # layouts are only designed/tested portrait; opts iPad out of Split View/Slide Over instead of requiring all 4 orientations
  bs['INFOPLIST_KEY_UISupportedInterfaceOrientations'] = 'UIInterfaceOrientationPortrait'
  bs['INFOPLIST_KEY_UISupportedInterfaceOrientations~ipad'] = 'UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown'
  bs['SWIFT_EMIT_LOC_STRINGS'] = 'NO'
  bs['ENABLE_PREVIEWS'] = 'YES'
end

project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(target)
scheme.set_launch_target(target)
scheme.save_as(PROJECT_PATH, 'SubTrakt', true)

puts "Generated #{PROJECT_PATH}"
