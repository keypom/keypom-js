#!/bin/bash

# Variables
source_folder="/Users/min/Documents/NEAR_Stuff/keypom-js/packages/one-click-connect" # Replace with the name of the folder to copy
destination_folder="one-click-connect" # Replace with the name of the folder to delete
destination_directory="/Users/min/Documents/NEAR_Stuff/guest-book-examples/frontend/node_modules/@keypom" # Replace with the path to the directory containing the folder to delete

# Step 1: Copy the folder in the current directory
cp -r "$source_folder" /tmp/copied_folder

# Step 2: Delete the folder from a different directory
rm -rf "$destination_directory/$destination_folder"

# Step 3: Paste the copied folder in the deleted folder's directory
mv /tmp/copied_folder "$destination_directory/$destination_folder"

# Optional: Print a message indicating the operation is complete
echo "Folder '$source_folder' has been copied to '$destination_directory' as '$destination_folder'"